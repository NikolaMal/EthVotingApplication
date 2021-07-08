pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Election {

  struct Participant {
    uint id;
    address addr;
    string name;
  }

  struct Owner {
    uint id;
    address addr;
    string name;
  }

  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  struct SingleElection {
    uint id;
    mapping(uint => Owner) owner;
    mapping(uint => Candidate) candidates;
    uint candidatesCount;
    mapping(uint => Participant) election_participants;
    mapping(address => bool) voted;
    uint participantsCount;
  }

  uint public singleElectionCount;
  mapping(address => SingleElection) public owners;
  mapping(address => SingleElection) public participants;
  mapping(uint => SingleElection) public singleElections;



  event votedEvent (
    uint indexed _candidateId
  );



  constructor() public {

  }

  function addCandidate(string memory _name) public {
    SingleElection storage election = owners[msg.sender];
    uint electionId = election.id;
    SingleElection storage t = singleElections[electionId];
    election.candidatesCount++;
    t.candidatesCount++;
    uint id = election.candidatesCount;
    election.candidates[id] = Candidate(id, _name, 0);
    t.candidates[id] = Candidate(id, _name, 0);
  }

  function addParticipant(address _addr, string memory _name) public {
    SingleElection storage election = owners[msg.sender];
    uint electionId = election.id;
    SingleElection storage singleElection = singleElections[electionId];
    election.participantsCount++;
    singleElection.participantsCount++;
    uint id = election.participantsCount;
    election.election_participants[id] = Participant(id, _addr, _name);
    participants[_addr] = election;
    singleElection.election_participants[id] = election.election_participants[id];
  }

  function vote (uint _candidateId, uint _electionId) public {
    require(!singleElections[_electionId].voted[msg.sender]);

    SingleElection storage election = singleElections[_electionId];

    election.candidates[_candidateId].voteCount++;

    election.voted[msg.sender] = true;
  }

  function newSingleElection(string memory _owner_name) public {
    require(owners[msg.sender].id==0);
    singleElectionCount ++;
    Owner memory t_owner;
    t_owner = Owner(singleElectionCount, msg.sender, _owner_name);
    singleElections[singleElectionCount] = SingleElection(singleElectionCount,0,0);
    singleElections[singleElectionCount].owner[0] = t_owner;
    owners[msg.sender] = singleElections[singleElectionCount];
  }

  function getStatus() public view returns (uint, uint){
    if(owners[msg.sender].id!=0){
      return (0, owners[msg.sender].id);
    }
    if(participants[msg.sender].id!=0){
      uint electionId = participants[msg.sender].id;
      if(!singleElections[electionId].voted[msg.sender]){
        return (1, participants[msg.sender].id);
      } else {
        return (2, participants[msg.sender].id);
      }
    }
    return (3, 0);
  }

  function getCandidate(uint electionId, uint key) public view returns (uint, string memory, uint){
    Candidate storage t = singleElections[electionId].candidates[key];

    uint id = t.id;
    string memory name = t.name;
    uint voteCount = t.voteCount;

    return (id, name, voteCount);

  }

}
