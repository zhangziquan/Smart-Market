pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;
contract SmartMarket{
    address public seller;
    string private key;
    uint public goodcount;
    struct good{
        address HighestBidder;
        uint id;
        uint nobarginprice;
        uint nowprice;
        uint lowestprice;
        uint time;
        state tradestate;
        string name;
        string key;
    }
    good[] private shelves;
    enum state {
        opened,
        locked,
        buyeraccept,
        completed
    }
    
    constructor () public payable{
        seller = msg.sender;
        goodcount = 0;
    }
    
    function buyitnowprice(uint id) payable public returns(string){
        require(seller!=msg.sender,"店主不能参与购买");
        require(id<goodcount,"错误的货品编号");
        if(shelves[id].tradestate == state.opened)
        {
            if(msg.value>shelves[id].nobarginprice){
                shelves[id].tradestate = state.locked;
                shelves[id].HighestBidder = msg.sender;
                return ("成功购买");
            }else{
                msg.sender.transfer(msg.value);
                return ("金额不足");
            }
        }else{
            msg.sender.transfer(msg.value);
            return("货品已结束交易");
        }
    }
    
    function buy (uint id) payable public returns(string,bool){
        require(seller!=msg.sender,"店主不能参与购买");
        require(id<goodcount,"错误的货品编号");
        uint newprice = msg.value;
        if(shelves[id].tradestate == state.opened)
        {
            if(newprice > shelves[id].nowprice){
                shelves[id].HighestBidder.transfer(shelves[id].nowprice);
                shelves[id].nowprice = newprice;
                shelves[id].HighestBidder = msg.sender;
                return("成功竞拍",true);
            }
            msg.sender.transfer(newprice);
            return("不足以成为最高投标者！",false);
        }
        else
        {
            return("货品已结束交易",false);
        }
    }
    
    function getBalance () public view returns(string,uint) {
        if(seller == msg.sender)
            return ("合约的余额为",address(this).balance);
        else
            return ("无权查询", 0);
    }
    
    function sellerconfirm (uint id) payable public returns(string,bool) {
        if(shelves[id].tradestate == state.locked && msg.sender == seller){
            if(id>goodcount){
                return("错误的货品编号",false);
            }else{
                msg.sender.transfer(msg.value);
                shelves[id].tradestate = state.buyeraccept;
                return ("成功确认",true);
            }
        }
        else{
            return("只有店主才能确定订单",false);
        }
    }
    
    function extraction (uint id) public view returns(string, bool){
        if(id>goodcount)
        {
            return ("错误的货品编号",false);
        }
        if(msg.sender == shelves[id].HighestBidder && (shelves[id].tradestate == state.buyeraccept||shelves[id].tradestate == state.completed))
        {
            return (shelves[id].key,true);
        }else
        {
            return ("无权取货",false);
        }
    }
    
    function takemoney () public{
        require(msg.sender == seller,"无权取钱");
        seller.transfer(address(this).balance);
    }
    
    function createsale(string _name, uint _lowerprice, uint _nobarginprice,string _key) public payable {
        require(msg.value > 2*_lowerprice,"押金过少,无法上架");
        good memory g;
        g.id = goodcount;
        goodcount++;
        g.name = _name;
        g.nowprice = _lowerprice;
        g.lowestprice = _lowerprice;
        g.nobarginprice = _nobarginprice;
        g.tradestate = state.opened;
        g.HighestBidder = this;
        g.key = _key;
        shelves.push(g);
    }
    
    function add(uint a, uint b) public pure returns (uint){
        return a+b;
    }
    
    function getgoodcount() public view returns(uint){
        uint num =0;
        for(uint i = 0;i<shelves.length;i++){
            if(shelves[i].tradestate== state.opened){
                num ++;
            }
        }
        return num;
    }
    
    function queryall() public view returns(string []){
        string [] memory allgoods = new string [](shelves.length);
        for(uint i=0;i<shelves.length;i++){
            allgoods[i]=(shelves[i].name);
        }
        return allgoods;
    }
    
    function querygoodbyid(uint id) public view returns(uint,string,uint,state,string){
        require(id<goodcount,"错误的货品编号");
        good memory thegood;
        thegood = shelves[id];
        thegood.key = "******";
        return(thegood.id,thegood.name,thegood.nowprice,thegood.tradestate,thegood.key);
    }

    function cancelsale(uint id) public returns (string,bool){
        if(id>goodcount)
        {
            return ("错误的货品编号",false);
        }
        if(shelves[id].tradestate == state.opened)
        {
            if(seller == shelves[id].HighestBidder)
            {
                seller.transfer(shelves[id].lowestprice * 2);
            }
            else{
                shelves[id].HighestBidder.transfer(shelves[id].nowprice);
                seller.transfer(shelves[id].lowestprice * 2);
            }
        }
        return ("撤销商品成功",true);
    }
    
    function acceptgood(uint id) public returns (string,bool){
        require(shelves[id].tradestate == state.opened && shelves[id].HighestBidder == msg.sender,"无权操作");
        if(id>goodcount)
        {
            return ("错误的货品编号",false);
        }
        if(shelves[id].tradestate == state.buyeraccept && msg.sender == shelves[id].HighestBidder)
        {
            seller.transfer(shelves[id].nowprice);
            shelves[id].tradestate == state.completed;
            return ("收货成功！",true);
        }else{
            return ("收货失败",false);
        }
    }
    
    function cancelorder(uint id) public returns (string,bool){
        if(id>goodcount)
        {
            return ("错误的货品编号",false);
        }
        require(shelves[id].tradestate == state.opened && shelves[id].HighestBidder == msg.sender,"无权操作");
        shelves[id].HighestBidder.transfer(shelves[id].nowprice * 99/100);
        shelves[id].HighestBidder = 0;
        shelves[id].nowprice = shelves[id].lowestprice;
        return ("取消订单成功",true);
    }
}