class DailyLog {
    constructor(date, weight, caloriesIn, steps, sleepHours) {
        this.date = new Date(date);
        this.weight = weight;
        this.caloriesIn = caloriesIn;
        this.steps = steps;
        this.sleepHours = sleepHours;
    }
}

export default DailyLog;