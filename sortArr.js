var SortedArray = require("collections/sorted-array");

const array = [[1, 1600], [2, 3900], [3,800], [4, 1800]]

const sorted = SortedArray( array,
    function equals (x, y) {
        return Object.equals(x[1], y[1])
    },
    function compare(x, y) {
        return Object.compare(x[1], y[1])
    }
);

console.log(sorted)