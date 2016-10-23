/**
 * Created by bruce on 2016/10/23.
 */
import _ from 'lodash'

class Connector {
    value = null;

    informant = null;

    constraints = [];

    hasValue() {
        return this.informant !== null;
    }

    getValue() {
        if (!this.hasValue()) {
            throw new Error("has no value")
        } else {
            return this.value;
        }
    }

    setValue(newVal, informant) {
        if (!this.hasValue()) {
            this.value = newVal;
            this.informant = informant;
            this.constraints.filter(c => c !== informant).forEach(c => c.processNewValue())
        } else if (this.value !== newVal) {
            throw new Error(`already has value: ${this.value}, can not set to: ${newVal}`)
        } else {
            return 'ignored'
        }
    }

    forgetValue(retractor) {
        if (retractor === this.informant) {
            this.informant = null;
            this.constraints.filter(c => c !== retractor).forEach(c => c.processForgetValue())
        } else {
            return 'ignored'
        }
    }

    connect(newConstraint) {
        this.constraints = _.uniq(this.constraints.concat([newConstraint]));
        if (this.hasValue()) {
            newConstraint.processNewValue()
        }
    }
}

class ConstantConstraint {
    constructor(value, connector) {
        connector.connect(this);
        connector.setValue(value, this);
    }

    processNewValue() {
        throw new Error('Can not process new value to constant')
    }

    processForgetValue() {
        throw new Error('Can not forget value of constant')
    }
}

class AdderConstraint {
    a1 = null;
    a2 = null;
    sum = null;

    constructor(a1, a2, sum) {
        this.a1 = a1;
        this.a2 = a2;
        this.sum = sum;
        a1.connect(this);
        a2.connect(this);
        sum.connect(this);
    }

    processNewValue() {
        let a1 = this.a1;
        let a2 = this.a2;
        let sum = this.sum;
        if (a1.hasValue() && a2.hasValue()) {
            sum.setValue(a1.getValue() + a2.getValue(), this);
        } else if (a1.hasValue() && sum.hasValue()) {
            a2.setValue(sum.getValue() - a1.getValue(), this);
        } else if (a2.hasValue() && sum.hasValue()) {
            a1.setValue(sum.getValue() - a2.getValue(), this);
        }
    }

    processForgetValue() {
        this.a1.forgetValue(this);
        this.a2.forgetValue(this);
        this.sum.forgetValue(this);
        this.processNewValue();
    }
}

// test

(function test1() {
    let conn1 = new Connector();
    console.log(conn1.hasValue());
})();

(function test2() {
    let conn1 = new Connector();
    let const5 = new ConstantConstraint(5, conn1);
    console.log(conn1.hasValue(), conn1.getValue());
})();

(function test3() {
    let conn1 = new Connector();
    let const5 = new ConstantConstraint(5, conn1);

    let conn2 = new Connector();
    // let const10 = new ConstantConstraint(10, conn2);

    let conn3 = new Connector();
    let const30 = new ConstantConstraint(30, conn3);

    let addConstraint = new AdderConstraint(conn1, conn2, conn3);

    console.log(conn2.hasValue(), conn2.getValue());
})();

(function test4() {
    let conn1 = new Connector();
    let const5 = new ConstantConstraint(5, conn1);
    let conn2 = new Connector();
    let const10 = new ConstantConstraint(10, conn2);

    let conn3 = new Connector();
    let addConstraint = new AdderConstraint(conn1, conn2, conn3);

    try {
        let constErr = new ConstantConstraint(0, conn3);
    } catch (e) {
        console.log(`Success throw an error: ${e.message}`)
    }
})();





