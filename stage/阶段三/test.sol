contract tradeplatform{
    address public seller;
    address private buyer;
    string private key;
    uint public highprice;
    uint public lowerprice;
    uint public nobarginprice;
    
    string[] private keys;
    struct good{
        address HighestBidder;
        uint nobarginprice;
        uint lowerprice;
        uint time;
        state tradestate;
        string name;
    }
    good[] shelves;
    enum state {
        opened,
        locked,
        buyeraccept,
        completed
    }
    state tradestate;

    
    function tradeplatform() payable{
        require(msg.value > 10000000);
        seller = msg.sender;
    }
    
    function buyitnowprice() payable public returns(string, bool){
        if(msg.value>nobarginprice){
            tradestate == state.locked;
            buyer = msg.sender;
        }
    }
    
    function buy () payable public returns(string,bool){
        require(seller!=msg.sender);
        var newprice = msg.value;
        if(tradestate == state.opened)
        {
            if(newprice > highprice){
                buyer.transfer(highprice);
                highprice = newprice;
                buyer = msg.sender;
                return("成功竞拍",true);
            }
            msg.sender.transfer(newprice);
            return("你的钱太少了！",false);
        }
        else
        {
            return("货品已结束交易",false);
        }
    }
    
    function getBalance () public returns(string,uint) {
        if(buyer == msg.sender || seller == msg.sender)
            return ("合约的余额为",this.balance);
        else
            return ("无权查询", 0);
    }
    
    function sellerconfirm () {
        require(tradestate == state.opened && msg.sender == seller);
        tradestate = state.locked;
    }
    
    function extraction () returns(string, bool){
        if(msg.sender == buyer && (tradestate == state.locked||tradestate == state.completed))
        {
            return (key,true);
            tradestate == state.completed;
        }else
        {
            return ("无权取货",false);
        }
    }
    
    function takemoney (){
        require(tradestate == state.completed && msg.sender == seller);
        seller.transfer(this.balance);
    }
    
    function createsale(string _name, string _key, uint _lowerprice, uint _nobarginprice) payable {
        require(msg.value > 2*_lowerprice);
        good memory g;
        g.lowerprice = _lowerprice;
        g.nobarginprice = _nobarginprice;
        g.tradestate = state.opened;
        g.HighestBidder = this;
    }

    function cancelsale(uint n) public returns (string){
        if(shelves[n].tradestate == state.opened)
            return ("yes");
    }
}