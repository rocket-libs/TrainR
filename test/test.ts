import TrainR, { ITrainRContext, TrainRState } from "../example/src/trainR";



class TestRepo{
    alpha: string = "blah";
    beta: number = 7;
    charlie: boolean = true;
} 

class TestState extends TrainRState{

}

class TestTarget{

}

class TestContext implements ITrainRContext<TestRepo,TestState,TestTarget>{
    repository: TestRepo = new TestRepo();
    state: TestState = new TestState();
    target: TestTarget = new TestTarget();
}

const blah = () => {
    const trainR  = new TrainR(new TestContext());
}