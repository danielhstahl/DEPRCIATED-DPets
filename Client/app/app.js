import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
var Web3 = require('web3');
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import {Table, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableBody} from 'material-ui/Table';
//const {Grid, Row, Col} = require('react-flexbox-grid');
import Paper from 'material-ui/Paper';
import MyRawTheme from 'theme';
var abi =[{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"trackNumberRecords","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"}],"name":"pet","outputs":[{"name":"timestamp","type":"uint256"},{"name":"typeAttribute","type":"uint8"},{"name":"attributeText","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"_petid","type":"bytes32"},{"name":"_type","type":"uint8"},{"name":"_attribute","type":"string"}],"name":"addAttribute","outputs":[],"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_petid","type":"bytes32"},{"indexed":false,"name":"_type","type":"Medical.PossibleAttributes"},{"indexed":false,"name":"_attribute","type":"string"}],"name":"attributeAdded","type":"event"}];
//var sandboxId = '9f51d5ec41'; //this changes
//var url='https://phillyfan1138.by.ether.camp:8555/sandbox/' + sandboxId; 
var port=8545;
var url='http://localhost:'+port; 
var web3 = new Web3(new Web3.providers.HttpProvider(url));
//web3.eth.defaultAccount = '0x8bfFa25d87Eb8744dC3C2534B496fBa010bC61b9';
console.log(web3.eth.accounts);
web3.eth.defaultAccount=web3.eth.accounts[1];
var contract = web3.eth.contract(abi).at('0x590Ab2750495F2c141794Ca36f153c299DD5f2fb');

//events work but possibly not needed in this applciation
/*var f2 = contract.allEvents();
f2.watch(function(err, result){
    console.log(result);
});*/
const muiTheme=getMuiTheme(MyRawTheme);
const divStyle={
    padding:50
};
const paperStyle={
    padding:20,
    margin:20
};
const CustomTable=React.createClass({
    
    render(){
        var self=this;
        //console.log(this.props.data);
        //console.log(this.props.columns);
        return(
            <Table>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        {this.props.columns.map(function(val, index){
                            return <TableHeaderColumn key={index}>{val}</TableHeaderColumn>
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {this.props.data.map(function(val, index){
                        return <TableRow key={index}>
                            {self.props.columns.map(function(val1, index1){
                                var displayVal=val[val1].toString();
                                /*if(displayVal instanceof Date){
                                    displayVal=displayVal.toString();
                                }*/
                                return <TableRowColumn key={index1}>{displayVal}</TableRowColumn>
                            })}
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        )
    }
});
const Main=React.createClass({
    getInitialState(){
        return {
            attributeType:0,
            attributeValue:"",
            petId:0,
            currentData:null,
            historicalData:null
        }
    },
    getAllRecords:function(id){
        var maxIndex=contract.trackNumberRecords(id).c[0];
        var currentResults=[];
        for(var i=0; i<maxIndex;++i){
            var val=contract.pet(id, i);
            currentResults.push({timestamp:new Date(val[0].c[0]*1000), attributeType:val[1].c[0], attributeText:val[2]});
        }
        return currentResults;
    },
    orderResults:function(){
        var results=this.getAllRecords(this.state.petId);
        var res1=alasql("SELECT MAX(timestamp) as mx, attributeType FROM $0 p GROUP BY attributeType", [results]);
        var res = alasql("SELECT t1.* FROM ? t1 INNER JOIN ? t2 ON t1.mx=t2.timestamp and t1.attributeType=t2.attributeType", [results, res1]);
        this.setState({
            currentData:res
        });
    },
    getHistoricalResults:function(){
        //console.log("got here");
        var results=this.getAllRecords(this.state.petId);
        var res=alasql("SELECT * FROM ? WHERE attributeType="+this.state.attributeType, [results]);
        //console.log(res);
        this.setState({
            historicalData:res
        });
    },
    addAttribute:function(){
        var self=this;
        contract.addAttribute.sendTransaction(this.state.petId, this.state.attributeType, this.state.attributeValue, {gas:3000000}, function(err, results){
            
            if(err){
                //alert("Error: "+err);
                console.log(err);
                console.log(results);
            }
            else{
                console.log(results);
                alert("Transaction Complete!");
                self.getHistoricalResults();
            }
        });
    },
    onId(event, func){
        if(event.keyCode===13){
            event.preventDefault();
            this[func]();
        }
        else{
            this.setState({
                petId:event.target.value
            });
        }
        
    },
    onAttributeType(event, func){
        if(event.keyCode===13){
            event.preventDefault();
            this[func]();
        }
        else{
            this.setState({
                attributeType:event.target.value
            });
        }
        
    },
    onAttributeValue(event, func){
        if(event.keyCode===13){
            event.preventDefault();
            this[func]();
        }
        else{
            this.setState({
                attributeValue:event.target.value
            });
        }
       
    },
    render(){
        var self=this;
        return(
    <MuiThemeProvider muiTheme={muiTheme}>
        <div style={divStyle}>
            <Paper style={paperStyle} zDepth={2}>
                <TextField onKeyUp={function(event){return self.onId(event, "addAttribute");}} floatingLabelText="Pet ID (int)"/> 
                <TextField onKeyUp={function(event){return self.onAttributeType(event, "addAttribute");}} floatingLabelText="Type Of Attribute (int)"/>
                <TextField onKeyUp={function(event){return self.onAttributeValue(event, "addAttribute");}} floatingLabelText="Attribute Value (string)"/>
                <RaisedButton secondary={true} onMouseDown={this.addAttribute} >Submit New Result (costs Ether)</RaisedButton>
            </Paper>
        
            <Paper style={paperStyle} zDepth={2}>
                <TextField onKeyUp={function(event){return self.onId(event, "orderResults");}} floatingLabelText="Pet ID (int)"/>
                <RaisedButton  secondary={true} onMouseDown={this.orderResults}>Search Recent Records</RaisedButton>
                {this.state.currentData&&this.state.currentData[0]?<CustomTable data={this.state.currentData} columns={Object.keys(this.state.currentData[0])}/>:null}
            </Paper>
        
            <Paper style={paperStyle} zDepth={2}>
                <TextField onKeyUp={function(event){return self.onId(event, "getHistoricalResults");}} floatingLabelText="Pet ID (int)"/>
                <TextField onKeyUp={function(event){return self.onId(event, "getHistoricalResults");}} floatingLabelText="Type Of Attribute (int)"/>
                <RaisedButton secondary={true} onMouseDown={this.getHistoricalResults}>Search Historical Records</RaisedButton>
                {this.state.historicalData&&this.state.historicalData[0]?<CustomTable data={this.state.historicalData} columns={Object.keys(this.state.historicalData[0])}/>:null}
            </Paper>
        
    </div>
    </MuiThemeProvider>
        );
    }
});
ReactDOM.render((
  <Main/>
), document.getElementById("app"));