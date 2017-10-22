if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider)
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
}

let optimize = 1
let compiler
let compiledContract

function deployContract() {
  for (let contractName in compiledContract.contracts) {
    let bytecode = compiledContract.contracts[contractName].bytecode
    let abi = compiledContract.contracts[contractName].interface
    let contract = web3.eth.contract(JSON.parse(abi))
    
    contract.new(
      {from: web3.eth.accounts[0], data: bytecode, gas: 1000000}, 
      newContractCallback
    )

    function newContractCallback(err, deployedContract) {
      getAccounts()
      if (!err) {
        !deployedContract.address
          ? console.log(deployedContract)
          : renderContractFunction(deployedContract, contractName)
      }
    }
  }
}

function renderContractFunction(contract, contractName) {
  const contractPanel = createContractPanel(contractName)
  createContractProps(contract, contractName, contractPanel)
  renderContract(contractPanel)
}

function createContractPanel(contractName) {
  const div = document.createElement('DIV')
  div.innerHTML = `<h3><strong>${contractName}</strong></h3>`
  div.className = 'mui-panel'
  return div
}

function renderContract(panel) {
  document
    .getElementById('contractFunction')
    .appendChild(panel)
}

function createContractProps(contract, contractName, panel) {
  const evmResponses = {
    '_eth': '_ETH',
    'abi': 'ABI',
    'allEvents': 'ALLEVENTS',
  }

  Object
    .entries(contract)
    .forEach(contractFunc => !evmResponses[contractFunc[0]]
      ? panel.append(createElement(contractFunc, contractName))
      : ''
    )
}

function createElement(contractFunc, contractName) {
  switch (typeof contractFunc[1]) {
    case 'function':
      return createFunctionButton(contractFunc)
      break
    default:
      return createElementType(contractFunc, 'P')
      break
  }
}

function createFunctionButton(contractFunc) {
  const btn = document.createElement('BUTTON')
  btn.innerText = contractFunc[0]
  btn.className = 'mui-btn mui-btn--primary'
  btn.addEventListener('click', contractFunc[1].call)
  return btn
}

function createElementType(contractFunc, element) {
  const newElement = document.createElement(element)
  newElement.innerHTML = `<br />
    <strong>${contractFunc[0]}</strong>: ${contractFunc[1]}
  `
  return newElement
}

function getAccounts() {
  return document
    .getElementById('deployed-contract')
    .innerHTML = `<br />
      <div>
        Account: ${web3.eth.accounts[0]} 
        <br />
        Balance: ${balanceInEth(web3.eth.accounts[0])}
      </div>
    `
}

function balanceInEth(address) {
  return web3.fromWei(web3.eth.getBalance(address).toString())
}  

function loadSolcVersion() {
  status(`Loading Solc: ${getVersion()}`)
  BrowserSolc.loadVersion(getVersion(), function(c) {
    compiler = c
    status("Solc loaded.  Compiling...")
    solcCompile(compiler)
  })
}

function getVersion() {
  return document.getElementById("versions").value
}

function solcCompile(compiler) {
  status("compiling")
  document.getElementById("compile-output").value = ""
  let result = compiler.compile(getSourceCode(), optimize)
  compiledContract = result
  let stringResult = JSON.stringify(result, null, 4)
  document.getElementById("compile-output").value = stringResult
  status("Compile Complete.")

  let estimateGasTotal = 0

  for (let contractName in compiledContract.contracts) {
    let bytecode = compiledContract.contracts[contractName].bytecode
    estimateGasTotal += web3.eth.estimateGas({ data: bytecode })
  }

  renderEstimatedGas(estimateGasTotal)
}

function renderEstimatedGas(estimateGas) {
  document
    .getElementById('estimated-gas')
    .innerText = `Estimated Gas: ${web3.fromWei(estimateGas)}`
}


function getSourceCode() {
  return document.getElementById("source").value
}


window.onload = function () {
  document.getElementById("source").value = exampleSource
  document.getElementById("versions").onchange = loadSolcVersion

  if (typeof BrowserSolc == 'undefined') {
    console.log("You have to load browser-solc.js in the page. We recommend using a <script> tag.")
    throw new Error()
  }

  getAccounts()
  status("Loading Compiler")

  BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
    populateVersions(soljsonSources)
    document.getElementById("versions").value = soljsonReleases["0.4.8"]
    loadSolcVersion()
  })
}

function populateVersions(versions) {
  sel = document.getElementById("versions")
  sel.innerHTML = ""

  for (let i = 0; i < versions.length; i++) {
    let opt = document.createElement('option')
    opt.appendChild(document.createTextNode(versions[i]))
    opt.value = versions[i]
    sel.appendChild(opt)
  }
}

function status(txt) {
  document.getElementById("status").innerHTML = txt
}

var exampleSource = `pragma solidity ^0.4.8;

contract Victim {
  uint public withdrawableBalance = 2 ether;

  function withdraw() {
    if (!msg.sender.call.value(withdrawableBalance)()) throw;
    withdrawableBalance = 0;
  }

  function deposit() payable {}
}

contract Attacker {
  Victim v;
  uint public count;

  event LogFallback(uint c, uint balance);

  function Attacker(address victim) {
    v = Victim(victim);
  }

  function attack() {
    v.withdraw();
  }

  function () payable {
    count++;
    LogFallback(count, this.balance);
    if (count < 10) {
      v.withdraw();
    } 
  }
}
`