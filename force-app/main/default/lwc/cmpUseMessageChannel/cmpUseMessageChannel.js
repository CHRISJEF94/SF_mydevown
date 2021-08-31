import { LightningElement,wire } from 'lwc';
import mcTest from '@salesforce/messageChannel/mcTest__c';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';

export default class CmpUseMessageChannel extends LightningElement {
    subscription = null;
    messageReceived;

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        console.log('It was connected');
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                mcTest,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
            console.log('this.subscription',this.subscription);
        }
        console.log('this.subscription',this.subscription);
    }

    connectedCallback() {
        console.log('This is loading');
        this.subscribeToMessageChannel();
    } 

    handleMessage(message) {
        console.log('message',message);
        // this.recordId = message.recordId;
    }

}