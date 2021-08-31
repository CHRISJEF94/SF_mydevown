import { LightningElement,api,wire,track } from 'lwc';
import getQuestionsRelated from '@salesforce/apex/ShowDataController.getQuestionsRelated';

export default class CmpShowQuestions extends LightningElement {
    @api recordId;
    @track hasErrors;
    questions = [];
    errors;

    @wire(getQuestionsRelated, {testId: '$recordId'})
    getAllQuestions({ error, data }) {
        if (data) {
            this.questions = data;
        } else if (error) {
            this.hasErrors = true;
            this.errors = error;
        }
    }

}