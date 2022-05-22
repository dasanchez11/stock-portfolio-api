const axios = require('axios')
require('dotenv').config();

exports.getTickerPrice = async (tickerName,interval,resSize=1) =>{
    const result = await axios.get(`https://api.twelvedata.com/time_series?apikey=${process.env.API_KEY}&interval=${interval}&symbol=${tickerName}&outputsize=${resSize}&format=JSON`)
    return result.data
}

exports.getIndices = (array) =>{
    let arr = []
    array.map(item=>{
        console.log(item.ticker)
    })

    return arr
}

exports.getQueryResult = (searchQuery,stocks,stockIndex)=>{
    let result = []
    const filteredValuesEqual = stockIndex.filter(item=>stocks[item].symbol.toLowerCase()===searchQuery.toLowerCase() || stocks[item].name_alpha.toLowerCase()===searchQuery.toLowerCase() || stocks[item].name.toLowerCase()===searchQuery.toLowerCase())
  
    if (filteredValuesEqual.length===0) {
        const filteredValueshas = stockIndex.filter(item=>stocks[item].symbol.toLowerCase().includes(searchQuery)|| stocks[item].name.toLowerCase().includes(searchQuery))
        result = filteredValueshas
       

    } else{
        result = filteredValuesEqual
    }

    returnValue = []
    result.map(item=>{
        returnValue.push(stocks[item])
    })
    return returnValue
}