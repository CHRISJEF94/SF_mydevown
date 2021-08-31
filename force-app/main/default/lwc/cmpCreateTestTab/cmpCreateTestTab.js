import { LightningElement,wire  } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import mcTest from '@salesforce/messageChannel/mcTest__c';

export default class CmpCreateTestTab extends LightningElement {

    @wire(MessageContext)
    messageContext;

    handleContactSelect(event) {
        console.log('It was clicked');
        const payload = { message: 'Hey! I was sent from another component!' };

        publish(this.messageContext, mcTest, payload);
    }
}