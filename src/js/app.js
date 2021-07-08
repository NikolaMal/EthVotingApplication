App = {
  web3Provider: null,
  electionId: 0,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {

    $.getJSON("Election.json", function(election) {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var owner_content = $("#owner_content");
    var no_content = $("#no_content");

    loader.show();
    content.hide();
    owner_content.hide();
    no_content.hide();

    window.ethereum.enable();
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Election.deployed().then(function(instance) { // get contract instance
        electionInstance = instance;
        return electionInstance.getStatus({from: App.account}).then(function(result){
          App.electionId = result[1].c[0];
          var code = result[0].c[0];
          switch(code){
            case 3: // user is not involved in any election
              loader.hide();
              no_content.show();
              break;
case 0: // user is owner of an election
var candidatesResultsOwner = $("#candidatesResultsOwner");
candidatesResultsOwner.empty();
electionInstance.owners(App.account).then(function(singleElection){
for(i=1;i<=singleElection[1];i++){
    electionInstance.getCandidate(singleElection[0], i, {from: App.account}).then(function(candidate) {
    var id = candidate[0];
    var name = candidate[1];
    var votes = candidate[2];
    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + votes + "</td></tr>"
    candidatesResultsOwner.append(candidateTemplate);
    });
}
});
loader.hide();
owner_content.show();
break;

case 1: // user is a participant that has not voted in an election
var candidatesResults = $("#candidatesResults");
candidatesResults.empty();
var candidatesSelect = $('#candidatesSelect');
candidatesSelect.empty();
electionInstance.participants(App.account).then(function(singleElection){
for(i=1;i<=singleElection[1];i++){
    var candidate = electionInstance.getCandidate(singleElection[0], i, {from: App.account}).then(function(candidate){
    var id = candidate[0];
    var name = candidate[1];
    var votes = candidate[2];
    var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + votes + "</td></tr>"
    candidatesResults.append(candidateTemplate);
    var candidateOption = "<option value='" + id + "' >" + name + "</ option>";
    candidatesSelect.append(candidateOption);
    });
}
});
loader.hide();
content.show();
break;

          case 2: // user is a participant that has voted in an election
            var candidatesResults = $("#candidatesResults");
            candidatesResults.empty();
            var candidatesSelect = $('#candidatesSelect');
            candidatesSelect.empty();
            electionInstance.participants(App.account).then(function(singleElection){
              for(i=1;i<=singleElection[1];i++){
                var candidate = electionInstance.getCandidate(singleElection[0], i, {from: App.account}).then(function(candidate){
                  var id = candidate[0];
                  var name = candidate[1];
                  var votes = candidate[2];
                  var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + votes + "</td></tr>"
                  candidatesResults.append(candidateTemplate);
                  var candidateOption = "<option value='" + id + "' >" + name + "</ option>";
                  candidatesSelect.append(candidateOption);
                });
              }
            });
            $("#form").hide();
            loader.hide();
            content.show();
            break;
        }
    });
  });
},

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.vote(candidateId, App.electionId, {from: App.account});
    }).then(function(result){
      App.render();
    }).catch(function(err){
      console.error(err);
    });
  },

  newElection: function() {
    var ownerName = $("#ownerName").val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.newSingleElection(ownerName, {from: App.account});
    }).then(function(res){
      App.render();
    }).catch(function(err){
      console.error(err);
    });

  },

  addCandidate: function(){
    var candidateName = $("#addCandidateName").val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.addCandidate(candidateName, {from: App.account});
    }).then(function(res){
      App.render();
    }).catch(function(err){
      console.error(err);
    });
  },


  addParticipant: function(){
    var participantName = $("#addParticipantName").val();
    var participantAddr = $("#addParticipantAddr").val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.addParticipant(participantAddr, participantName, {from: App.account});
    }).then(function(res){
      App.render();
    }).catch(function(err){
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
