import { LightningElement,api,wire,track } from 'lwc';
import getOptionsRelated from '@salesforce/apex/ShowDataController.getOptionsRelated';

export default class CmpShowOptions extends LightningElement {
    @api recordId;
    @track hasErrors;
    options = [];
    errors;


    @wire(getOptionsRelated, {testId: '$recordId'})
    getAllOptions({ error, data }) {
        if (data) {
            console.log(data);
            this.options = data;
        } else if (error) {
            console.log(error);
            this.hasErrors = true;
            this.errors = error;
        }
    }

}