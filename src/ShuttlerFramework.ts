import Shuttler from "shuttlerjs";
const uuidv1 = require('uuid/v1');

export class ShuttlerState{
    changeId: string = "";
}

/**
 * Shuttler model attempts to organize data & state in buckets in a time-related manner i.e past,present,future.
 * Repository - a snapshot of data at a past moment in time. E.g, a look-up table. This is a likely a local copy of data from the source of truth (server, db, e.t.c).
 * State - state variables, represent the present context your application is in. This are variables liable to change frequently.
 * TTarget - represents the final or future desired dataset.
 * The general idea of this paradigm, is that the repository will contain all data required, while state shall provide the application with sufficient context to work on the data and build the final target dataset.
 */
export interface IShuttlerModel<TRepository,TState extends ShuttlerState,TTarget>{
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
export default class ShuttlerFx<TRepository,TState extends ShuttlerState,TTarget>  {
    private shuttler: Shuttler<IShuttlerModel<TRepository,TState,TTarget>>;

    constructor(initialModel: IShuttlerModel<TRepository,TState,TTarget>){
        this.shuttler = new Shuttler<IShuttlerModel<TRepository,TState,TTarget>>(initialModel);
    }

    /**
     * A snapshot of data at a past moment in time. E.g, a look-up table. This is a likely a local copy of data from the source of truth (server, db, e.t.c).
     */
    public get repository(): TRepository {
        return this.shuttler.model.repository;
    }

    /**
     * State variables, represent the present context your application is in. This are liable to change frequently.
     */
    public get state() : TState {
        return this.shuttler.model.state;
    }

    /**
     * Represents the final or future desired dataset.
     */
    public get target() : TTarget {
        return this.shuttler.model.target;
    }

    /**
     * Updates the target object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in target.
     */
    public pushToTarget(value: object){
        this.pushToObject(this.target,value);
    }

    /**
     * Updates the state object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in state.
     */
    public pushToState(value: object){
        this.pushToObject(this.state,value);
    }

    /**
     * Updates the repository object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in repository.
     */
    public pushToRepository(value: object){
        this.pushToObject(this.repository,value);
    }

    /**
     * This method allows you to add a listener for changes to the model.
     * Be sure to add at least one listener, otherwise you'll have no way of knowing your model has changed.
     * The call to 'subscribe' returns a callback function which can be used to clean up the subscription.
     * @param fn the function to be called to notify the subscriber that the model changed.
     */
    public subscribe(fnListener: (model: IShuttlerModel<TRepository,TState,TTarget>) => void) : () => void {
        return this.shuttler.subscribe(fnListener);
    }

    /**
     * You may use this method to fire a notification to all listeners that the model has changed.
     */
    public broadcastModelChange() {
        this.shuttler.model.state.changeId = uuidv1();
        this.shuttler.broadcastModelChanged();
    }

    

    private pushToObject(destinationObject: any,value: object) {
        const targetPropertyNames = Object.getOwnPropertyNames(value);
        targetPropertyNames.map(propertyName => this.writeToObject(destinationObject,propertyName,value));
        this.broadcastModelChange();
    }

    private writeToObject(destinationObject: object,propertyName: string,sourceOject: any) {
        const value = sourceOject[propertyName];
        Reflect.set(destinationObject,propertyName,value);
    }
}