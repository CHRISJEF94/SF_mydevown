import { LightningElement,track,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createTestData from '@salesforce/apex/TestCreatorController.createTestData';
import updateTestData from '@salesforce/apex/TestEditorController.updateTestData';

export default class CmpTestData extends NavigationMixin(LightningElement) {
    @api recordIdActual;

    @track isLoading = false;

    getEventMethod(){
        let method = '';
        if( this.recordIdActual=='NO DATA' ){
            method = 'CREATE';
        }else{
            method = 'EDIT';
        } 
        return method;
    }
    
    handleProcessBasedOnEvent(){
        this.isLoading = true;

        let optionsData = this.template.querySelector("c-cmp-opcion-data").getOptions();
        let questionsData = this.template.querySelector("c-cmp-question-data").getQuestions();
        let testData = this.template.querySelector("c-cmp-general-information-data").getTest();

        console.log('optionsData:'+optionsData);
        console.log('questionsData:'+questionsData);

        let validationMessage = this.validateData(testData,optionsData,questionsData);

        if(validationMessage.hasError){
            this.showToastMessage('Error',validationMessage.message,'error');
            this.isLoading=false;
            return;
        }

        if( this.getEventMethod() == 'CREATE' ){
            this.handleSaveData(testData,optionsData,questionsData);
        }else{
            console.log('INGRESO AL EDIT');
            this.handleEditData(testData,optionsData,questionsData);
        }

        /*if( this.getEventMethod()=='CREATE' ){
            this.resetInputs();
        }else{
            console.log("ENTRO AL REFRESH APEX");
            this.refreshInputs();
        }*/

        //this.isLoading=false;
    }

    handleSaveData(testData,optionsData,questionsData){
        createTestData({test:testData,lstOpciones:optionsData,lstPreguntas:questionsData})
        .then(result => {
            this.showToastForResult(result);
            this.resetInputs();
            this.isLoading=false;
        })
        .catch(error => {
            this.showToastMessage('Error',error,'error');
        });
    }

    handleEditData(testData,optionsData,questionsData){
        updateTestData({test:testData,lstOpciones:optionsData,lstPreguntas:questionsData})
        .then(result => {
            this.showToastForResult(result);
            this.refreshInputs();
            this.isLoading=false;
        })
        .catch(error => {
            this.showToastMessage('Error',error,'error');
        });
    }

    validateData(testData,optionsData,questionsData){
        if( testData.Name=="" || testData.Tipo__c==""){
            return {hasError:'true',message:'Revise la información del test ingresada'};
        }
        if(optionsData.length == 0){
            return {hasError:true,message:'Revise las opciones ingresadas'};
        }
        if(this.validateFieldOnOptionsData(optionsData)){
            return {hasError:true,message:'Revise la información de las opciones ingresadas, esta debe estar completa.'};
        }
        if(questionsData.length == 0){
            return {hasError:true,message:'Revise las preguntas ingresadas'};
        }
        if(this.validateFieldOnQuestionsData(questionsData)){
            return {hasError:true,message:'Revise la información de las preguntas ingresadas, esta debe estar completa.'};
        }
        return {hasError:false,message:''};
    }

    validateFieldOnOptionsData(optionsData){
        let hasBlankValues = false;
        optionsData.forEach(function(element , index ){
            if( element.Name=="" || element.Valor__c=="" ){
                hasBlankValues = true;
            }
            if( element.Tiene_Multiples_Valores__c && element.Valor__c.split(',').length <=1 ){
                hasBlankValues = true;
            }
        });
        return hasBlankValues;
    }

    validateFieldOnQuestionsData(questionsData){
        let hasBlankValues = false;
        questionsData.forEach(function(element , index ){
            if( element.Name=="" ){
                hasBlankValues = true;
            }
        });
        return hasBlankValues;
    }

    showToastMessage(relTitle,relMessage,typeOfMessage){
        const evt = new ShowToastEvent({
            title: relTitle,
            message: relMessage,
            variant: typeOfMessage,
        });
        this.dispatchEvent(evt);
    }

    showToastForResult(result){
        let message = '';
        let typeOfMessage = '';
        let title = '';
        if(result=='OK'){
            message = 'El test fue guardado correctamente';
            typeOfMessage = 'success';
            title = 'Correcto';
        }else{
            message = result;
            typeOfMessage = 'error';
            title = 'Error';
        }
        this.showToastMessage(title,message,typeOfMessage);
    }

    resetInputs(){
        this.template.querySelector("c-cmp-opcion-data").resetOpcionInputs();
        this.template.querySelector("c-cmp-question-data").resetQuestionInputs();
        this.template.querySelector("c-cmp-general-information-data").resetTestInputs();
    }

    refreshInputs(){
        location.reload();
        /*this.template.querySelector("c-cmp-general-information-data").refreshTestInputs();
        this.template.querySelector("c-cmp-opcion-data").refreshOpcionInputs();
        this.template.querySelector("c-cmp-question-data").refreshQuestionInputs();*/
    }

    redirectToGeneralList(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Test__c',
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            },
        });
    }

}