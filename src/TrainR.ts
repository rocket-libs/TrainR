import Shuttler from "shuttlerjs";
const uuidv1 = require('uuid/v1');


export interface ITrainR{
    getContext: <TContext>() => TContext;
    
    pushToTarget: <TTarget>(value: Partial<TTarget>) => void; 

    pushToState: <TState>(value: Partial<TState>) => void;

    pushToRepository: <TRepository>(value: Partial<TRepository>) => void;
}

export class TrainRState{
    changeId: string = "";
    trainR: ITrainR = {} as ITrainR;
}

/**
 * Shuttler model attempts to organize data & state in buckets in a time-related manner i.e past,present,future.
 * Repository - a snapshot of data at a past moment in time. E.g, a look-up table. This is a likely a local copy of data from the source of truth (server, db, e.t.c).
 * State - state variables, represent the present context your application is in. This are variables liable to change frequently.
 * TTarget - represents the final or future desired dataset.
 * The general idea of this paradigm, is that the repository will contain all data required, while state shall provide the application with sufficient context to work on the data and build the final target dataset.
 */
export interface ITrainRContext<TRepository,TState extends TrainRState,TTarget>{
    repository: TRepository;
    state: TState;
    target: TTarget;
}

/**
 * ShuttlerFx provides a method to read repository, state and target.
 * Additionally ShuttlerFx will allow WRITING to repository, state and target and consequently broadcast changes to subscribers.
 * WARNING: Bypassing the writing methods provided by ShuttlerFx to directly mutate the model will probably result in subscribers not
 * being notified of changes and hence an unpredictable application state.
 */

 export default class TrainR<TContext  extends ITrainRContext<any,any,any>>{
     private worker: TrainRWorker<TContext,any,any,any>;
     constructor(context: TContext){
         this.worker = new TrainRWorker(context);
     }

     public getContext(): TContext {
        return this.worker.context;
    }

    /**
     * Updates the target object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in target.
     */
    public pushToTarget<TTarget>(value: Partial<TTarget>){
        this.worker.pushToTarget<TTarget>(value);
    }

    /**
     * Updates the state object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in state.
     */
    public pushToState<TState>(value: Partial<TState>){
        this.worker.pushToState<TState>(value);
    }

    /**
     * Updates the repository object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in repository.
     */
    public pushToRepository<TRepository>(value: Partial<TRepository>){
        this.worker.pushToRepository<TRepository>(value);
    }

    /**
     * This method allows you to add a listener for changes to the model.
     * Be sure to add at least one listener, otherwise you'll have no way of knowing your model has changed.
     * The call to 'subscribe' returns a callback function which can be used to clean up the subscription.
     * @param fn the function to be called to notify the subscriber that the model changed.
     */
    public subscribe(fnListener: (model: ITrainRContext<any,any,any>) => void) : () => void {
        return this.worker.subscribe(fnListener);
    }

    /**
     * You may use this method to fire a notification to all listeners that the model has changed.
     */
    public broadcastModelChange() {
        this.worker.broadcastModelChange();
    }
 }

class TrainRWorker<TRepository,TState extends TrainRState,TTarget,TContext  extends ITrainRContext<TRepository,TState,TTarget>> implements ITrainR {
    private shuttler: Shuttler<TContext>;

    constructor(initialModel: TContext){
        this.shuttler = new Shuttler<TContext>(initialModel);
        initialModel.state.trainR = this;
    }

    /**
     * get 
     */
    public getContext<T>() : T {
        return this.context as unknown as T;
    }

    /**
     * get context
    */
    public get context(): TContext {
        return this.shuttler.model;
    }

    /**
     * Updates the target object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in target.
     */
    public pushToTarget<TTarget>(value: Partial<TTarget>){
        this.pushToObject(this.context.target,value);
    }

    /**
     * Updates the state object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in state.
     */
    public pushToState<TState>(value: Partial<TState>){
        this.pushToObject(this.context.state,value);
    }

    /**
     * Updates the repository object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in repository.
     */
    public pushToRepository<TRepository>(value: Partial<TRepository>){
        this.pushToObject(this.context.repository,value);
    }

    /**
     * This method allows you to add a listener for changes to the model.
     * Be sure to add at least one listener, otherwise you'll have no way of knowing your model has changed.
     * The call to 'subscribe' returns a callback function which can be used to clean up the subscription.
     * @param fn the function to be called to notify the subscriber that the model changed.
     */
    public subscribe(fnListener: (model: ITrainRContext<TRepository,TState,TTarget>) => void) : () => void {
        return this.shuttler.subscribe(fnListener);
    }

    /**
     * You may use this method to fire a notification to all listeners that the model has changed.
     */
    public broadcastModelChange() {
        this.shuttler.model.state.changeId = uuidv1();
        this.shuttler.broadcastModelChanged();
    }

    

    private pushToObject(destinationObject: any,value: object | unknown) {
        const targetPropertyNames = Object.getOwnPropertyNames(value);
        targetPropertyNames.map(propertyName => this.writeToObject(destinationObject,propertyName,value));
        this.broadcastModelChange();
    }

    private writeToObject(destinationObject: object,propertyName: string,sourceOject: any) {
        const value = sourceOject[propertyName];
        Reflect.set(destinationObject,propertyName,value);
    }
}