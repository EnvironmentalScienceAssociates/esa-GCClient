


///Calculate Percentile from Data Set

export function getPercentile(dataset, field, percentile){
    if(percentile>1)
        percentile=100/percentile;
    var values = [];
    dataset.map(item=>{
        if(item[field]!==-9999 && item[field]!==undefined)
        values.push(item[field]);
    })
     
    var res = quantile(values,percentile);
    
    return res;

}

const asc = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

