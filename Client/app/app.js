import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
var Web3 = require('web3');
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
//import FlatButton from 'material-ui/flat-button';
//import Dialog from 'material-ui/dialog';
//import ThemeManager from 'material-ui/styles/theme-manager';
//import LightRawTheme from 'material-ui/styles/raw-themes/light-raw-theme';
//import LeftNav from 'material-ui/left-nav';
//import AppBar from 'material-ui/app-bar';
//import MenuItem from 'material-ui/menus/menu-item';
import Paper from 'material-ui/Paper';
//import CircularProgress from 'material-ui/circular-progress';
//import DatePicker from 'material-ui/date-picker/date-picker';
//import Colors from 'material-ui/styles/colors';
import MyRawTheme from 'theme';
var abi =[{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"trackNumberRecords","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"}],"name":"pet","outputs":[{"name":"timestamp","type":"uint256"},{"name":"typeAttribute","type":"uint8"},{"name":"attributeText","type":"string"}],"type":"function"},{"constant":false,"inputs":[{"name":"_petid","type":"bytes32"},{"name":"_type","type":"uint8"},{"name":"_attribute","type":"string"}],"name":"addAttribute","outputs":[],"type":"function"}];
var sandboxId = '9195019bec'; //this changes
var url='https://phillyfan1138.by.ether.camp:8555/sandbox/' + sandboxId; 
var web3 = new Web3(new Web3.providers.HttpProvider(url));
web3.eth.defaultAccount = '0xdedb49385ad5b94a16f236a6890cf9e0b1e30392';
var contract = web3.eth.contract(abi).at('0x17956ba5f4291844bc25aedb27e69bc11b5bda39');
const muiTheme=getMuiTheme(MyRawTheme);
const Main=React.createClass({
    /*getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(MyRawTheme),//this.state.muiTheme,
        };
    },*/
    getInitialState(){
        return {
            attributeType:0,
            attributeValue:"",
            petId:0
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
        console.log("got here");
        var results=this.getAllRecords(this.state.petId);
        var res1=alasql("SELECT MAX(timestamp) as mx, attributeType FROM $0 p GROUP BY attributeType", [results]);
        var res = alasql("SELECT t1.* FROM ? t1 INNER JOIN ? t2 ON t1.mx=t2.timestamp and t1.attributeType=t2.attributeType", [results, res1]);
        console.log(res);
        return res;
    },
    getHistoricalResults:function(){
        console.log("got here");
        var results=this.getAllRecords(this.state.petId);
        var res=alasql("SELECT * FROM $0 p WHERE attributeType="+this.state.attributeType+" ORDER BY timestamp DESC", [results]);
        console.log(res);
        return res;
    },
    addAttribute:function(){
        contract.addAttribute.sendTransaction(this.state.petId, this.state.attributeType, this.state.attributeValue, {gas:3000000});
    },
    onId(event){
        this.setState({
            petId:event.target.value
        });
    },
    onAttributeType(event){
        this.setState({
            attributeType:event.target.value
        });
    },
    onAttributeValue(event){
        this.setState({
            attributeValue:event.target.value
        });
    },
    render(){
        return(
    <MuiThemeProvider muiTheme={muiTheme}>
    <div>
        <Paper>
            <TextField onKeyDown={this.onId} floatingLabelText="Pet ID (int)"/> 
            <TextField onKeyDown={this.onAttributeType} floatingLabelText="Type Of Attribute (int)"/>
            <TextField onKeyDown={this.onAttributeValue} floatingLabelText="Attribute Value (string)"/>
            <RaisedButton onMouseDown={this.addAttribute} >Submit New Result (costs Ether)</RaisedButton>
        </Paper>
        <Paper>
            <TextField onKeyDown={this.onId} floatingLabelText="Pet ID (int)"/>
            <RaisedButton onMouseDown={this.orderResults}>Search Recent Records</RaisedButton>
        </Paper>
        <Paper>
            <TextField onKeyDown={this.onId} floatingLabelText="Pet ID (int)"/>
            <TextField onKeyDown={this.onAttributeType} floatingLabelText="Type Of Attribute (int)"/>
            <RaisedButton onMouseDown={this.getHistoricalResults}>Search Historical Records</RaisedButton>
        </Paper>
    </div>
    </MuiThemeProvider>
        );
    }
});
ReactDOM.render((
  <Main/>
), document.getElementById("app"));