contract PetTracker{
    enum PossibleAttributes{
        Name,
        Address,
        Temperament,
        Incident
    }
    uint public constant costToAdd=1000000000000000000;//way too high lol.  one ether
    address public owner;

    struct Attribute{
      uint timestamp;
      PossibleAttributes typeAttribute;
      string attributeText;
    }
    function PetTracker(){
      owner=msg.sender;
    }
    mapping(bytes32=> mapping(uint=> Attribute) ) public pet; // hash of pet id to array of attributes
    mapping(bytes32=> uint) public trackNumberRecords; //number of records that a given pet has
    event attributeAdded(bytes32 _petid, PossibleAttributes _type, string _attribute);
    event attributeError(bytes32 _petid, string error);
    function addAttribute(bytes32 _petid, PossibleAttributes _type, string _attribute){
      if(msg.sender.balance<costToAdd){
        attributeError(_petid, "Too little Ether");
        return;
      }
      if(owner!=msg.sender){
        if(!owner.send(costToAdd)){
          attributeError(_petid, "Ether not sent");
          return;
        }
      }
      if(trackNumberRecords[_petid]>0){
        pet[_petid][trackNumberRecords[_petid]]=Attribute(now, _type, _attribute);
        trackNumberRecords[_petid]+=1;
      }
      else{
        trackNumberRecords[_petid]=1;
        pet[_petid][0]=Attribute(now, _type, _attribute);
      }
      attributeAdded(_petid, _type, _attribute);
    }
    function kill() {
      if(msg.sender == owner) { // Only let the contract creator do this
          selfdestruct(owner); // Makes contract inactive, returns funds
      }
    }
    function () {
        throw; // throw reverts state to before call
    }

}