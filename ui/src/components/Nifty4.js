const type='nifty';
// const type = 'bank_nifty';
var urlData = `http://localhost:8080/api/setOptionData`;
var urlDataArray = `http://localhost:8080/api/setOptionDataArray`;
var changeEvent = new Event('change');
var bidQtyIndex = 13;
var callDiffIndex = 2;
var putDiffIndex = 20;
// var baseDiffIndices = [];
// var diffItems = 6;
// for (var i=0; i<diffItems; i++) {
//     baseDiffIndices.push(i);  
// }

var callTotalIndex = 1;
var putTotalIndex = 21;
var totalItems = 5;
var baseTotalIndices = [];
for (var i=-1; i<totalItems; i++) {
    baseTotalIndices.push(i);  
}

var baseTotalIndices2 = [];
for (var i=-2; i<totalItems; i++) {
    baseTotalIndices2.push(i);  
}

console.log(`started ${type}`);

function compute() {
    var table = document.querySelector('#optionChainTable-indices');
    if (!table) {
        console.log('dom error'); return;
    }
    var rows = table.find('tr');

    var zeroIndex = null;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].children[bidQtyIndex] && rows[i].children[bidQtyIndex].hasClass('bg-yellow')) {
            zeroIndex = i; break;
        }
    }
    // var diffIndices = baseDiffIndices.map(item => item + zeroIndex);
    // var callDiff = 0;
    // var putDiff = 0;
    // diffIndices.forEach(item => {
    //     callDiff += Number(rows[item].children[callDiffIndex].innerText.replaceAll(',', ''));
    //     putDiff += Number(rows[item].children[putDiffIndex].innerText.replaceAll(',', ''));
    // });

    var totalIndices = baseTotalIndices.map(item => item + zeroIndex);
    // var callTotal = 0;
    // var putTotal = 0;
    // totalIndices.forEach(item => {
    //     callTotal += Number(rows[item].children[callTotalIndex].innerText.replaceAll(',', ''));
    //     putTotal += Number(rows[item].children[putTotalIndex].innerText.replaceAll(',', ''));
    // });

    // var totalIndices2 = baseTotalIndices2.map(item => item + zeroIndex);
    // var callTotal2 = 0;
    // var putTotal2 = 0;
    // totalIndices2.forEach(item => {
    //     callTotal2 += Number(rows[item].children[callTotalIndex].innerText.replaceAll(',', ''));
    //     putTotal2 += Number(rows[item].children[putTotalIndex].innerText.replaceAll(',', ''));
    // });

    // // data array implementation
    // // var totalIndices2 = baseTotalIndices2.map(item => item + zeroIndex);
    var callArray = [];
    var putArray = [];
    var strikeArray = [];
    const entries = 6;
    for(var i=-(entries); i<entries; i++) {
        callArray.push(Number(rows[zeroIndex + i].children[callTotalIndex].innerText.replaceAll(',', '')));
        putArray.push(Number(rows[zeroIndex + i].children[putTotalIndex].innerText.replaceAll(',', '')));
        strikeArray.push(Number(rows[zeroIndex + i].children[11].innerText.replaceAll(',', '')));
    }
    // const data = {};
    // totalIndices.forEach(item => {
    //     data[rows[item].children[11].innerText.replaceAll(',', '')] = [rows[item].children[callTotalIndex].innerText.replaceAll(',', ''), rows[item].children[putTotalIndex].innerText.replaceAll(',', '')];
    // });
    var timestamp = new Date();
    var underlyingValue = document.querySelector('#equity_underlyingVal').innerText.split(' ')[1].replaceAll(',', '');
    // console.log(callTotal, putTotal, timestamp, callArray, putArray, underlyingValue)
    console.log(timestamp, callArray, putArray, strikeArray, underlyingValue);
    // fetch(`${url}&callTotal=${callDiff}&putTotal=${putDiff}&callTotal2=${callTotal}&putTotal2=${putTotal}&timestamp=${timestamp}`)
    // fetch(`${urlData}?&callTotal=${callTotal}&putTotal=${putTotal}&callTotal2=${callTotal2}&putTotal2=${putTotal2}&timestamp=${timestamp}&type=${type}`)
    fetch(`${urlDataArray}?&callArray=${JSON.stringify(callArray)}&putArray=${JSON.stringify(putArray)}&strikeArray=${JSON.stringify(strikeArray)}&timestamp=${timestamp}&underlyingValue=${underlyingValue}&type=${type}`)
 
    var dd = document.querySelector('#equity_optionchain_select')
    dd.value = type === 'nifty' ? 'NIFTY' : 'BANKNIFTY';
    dd.dispatchEvent(changeEvent);
};

function setUp2() {
    var dd = document.querySelector('#equity_optionchain_select')
    // dd.value = 'NIFTY';
    dd.value = type === 'nifty' ? 'NIFTY' : 'BANKNIFTY';
    dd.dispatchEvent(changeEvent);
}

function setUp() {
    if (window.location.href.indexOf('nseindia.com/option-chain') === -1) {
        setTimeout(setUp2, 15000);
        window.location.href = 'https://www.nseindia.com/option-chain';
    } else {
        setUp2();
    }
}

setUp2();
compute();
var timer = setInterval(compute, 3000 * 60);
