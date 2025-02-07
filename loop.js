let prices = [536, 57632, 6639, 32417, 53845];

function mean(arr) {
    let sum = 0;
    for (i = 0; i <= arr.length; i++) {
        sum += arr[0];
    }
    return sum / arr.length
}

let runnerClock = new Set([1.23, 1.24, 1.35, 1.40])

function convertMinutesToSeconds(timeInMinute) {
    let secondSet = new Set();
    timeInMinute.forEach(
        time => {
            secondSet.add(time % 1 / 100 * 60 + ~~time * 60)
        }
    )
    return secondSet
}

convertMinutesToSeconds(runnerClock)