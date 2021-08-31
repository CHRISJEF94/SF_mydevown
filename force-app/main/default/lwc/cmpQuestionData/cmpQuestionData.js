import { LightningElement,track,api,wire } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor'
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getQuestionsRelated from '@salesforce/apex/TestEditorController.getQuestionsRelated';
import deleteQuestion from '@salesforce/apex/TestEditorController.deleteQuestion';

export default class CmpQuestionData extends LightningElement {
    formFactor = (FORM_FACTOR == 'Large' ? true:false);
    //Ese valor es pasado desde el 
    //Aura component PADRE, que engloba todos los 
    //Web component
    //Es el id del registro actual que se esta editando
    @api recordIdActual;

    //Variable que guarda toda la data que ingresamos 
    //en la pantalla
    @track
    questions = [];

    //Nos permite definir si estamos en modo CREACION o 
    //EDICION
    getEventMethod(){
        let method = '';
        if( this.recordIdActual=='NO DATA' ){
            method = 'CREATE';
        }else{
            method = 'EDIT';
        } 
        return method;
    }

    //Se para traer la data de preguntas cuando estamos
    //en modo EDIT
    @wire(getQuestionsRelated,{testId: '$recordIdActual' })
    getAllDataQuestions({ error, data }) {
        if (data) {
            if( data.length > 0 ){
                this.questions = this.constructDataToEdit(data);
            }
        } else if (error) {
            this.errors = error;
        }
    }

    //Nos permite agregar una fila más de preguntas
    addOneMoreQuestion() { 
        let actualNumberOfQuestion =  this.questions.length;

        this.questions.push({
            pos                      :   actualNumberOfQuestion,
            cardName                 :   'Pregunta '+(actualNumberOfQuestion+1),
            Id                       :   null,
            Orden__c                 :   0,
            Descripcion__c           :   '',
            Usa_valores_inversos__c  :   false,
            Valor__c                 :   0,
            Test__c                  :   null
        });
        
        this.questions.forEach(function(element , index ){
            element.pos = index
        });
    }

    @api
    getQuestions(){
        if(this.questions.length==0){
            return [];
        }
        let lstQuestions = [];

        this.questions.forEach(function(element , index ){
            lstQuestions.push({
                Id                          :   element.Id,
                Orden__c                    :   (index+1) ,
                Descripcion__c              :   element.Descripcion__c,
                Valor__c                    :   parseInt(element.Valor__c),
                Usa_valores_inversos__c     :   element.Usa_valores_inversos__c,
                Test__c                     :   element.Test__c
            });
        });
        
        return lstQuestions;
    }

    //Metodo que se llama al momento de editar un campo en la vista
    //guarda la data ingresada en el campo respectivo
    handleChangeDataInput(event){
        let rowIndex                        =   event.target.dataset.rowIndex;
        let nameId                          =   event.target.dataset.nameId;
        let value                           =   event.target.value;
        if( nameId == 'Usa_valores_inversos__c' ){
            this.setUsaValoresInversosValue(rowIndex);
        }else{
            this.questions[rowIndex][nameId]    =   value;
        }
    }

    setUsaValoresInversosValue(rowIndex){
        let actualValue = this.questions[rowIndex]['Usa_valores_inversos__c'];
        if(!actualValue){
            this.questions[rowIndex]['Usa_valores_inversos__c'] = true;
        }else{
            this.questions[rowIndex]['Usa_valores_inversos__c'] = false;
        }
    }

    //Metodo publico que nos permite limpiar toda 
    //la data almacenada en la variable de
    //preguntas
    @api
    resetQuestionInputs() { 
        this.questions = [];
    }

    //Metodo publico que nos permite actualizar toda 
    //la data almacenada en la variable de
    //options
    @api
    refreshQuestionInputs(){
        console.log('ENTRO REFRESH QUESTION');
        refreshApex(this.getAllDataQuestions);
    }

    //Es llamado por el evento wire y agrega el campo pos
    //a todos los registros
    constructDataToEdit(dataToEdit){
        let dataConstruct = [];

        dataToEdit.forEach(function(element , index ){
            dataConstruct.push({
                Id                       :   element.Id,
                pos                      :   index,
                Orden__c                 :   element.Orden__c,
                Descripcion__c           :   element.Descripcion__c,
                Usa_valores_inversos__c  :   element.Usa_valores_inversos__c,
                Valor__c                 :   element.Valor__c,
                Test__c                  :   element.Test__c
            });
        });
        
        return dataConstruct;
    }


    //Deletion of data
    handleDeleteQuestion(event) { 
        let rowIndex = event.target.dataset.rowIndex;
        if(this.getEventMethod() == 'CREATE'){
            this.handleDeleteOnCreation(rowIndex);
        }else{
            this.handleDeleteOnEdition(rowIndex);
        }
    }

    //Aunque se esta en modo EDICION hay filas de preguntas
    //que no poseen Id, por lo tanto se debe hacer una 
    //eliminacion a nivel de vista, en otras se hara una
    //eliminacion a nivel de base de datos
    handleDeleteOnEdition(rowIndex){
        let idQuestion = this.questions[rowIndex]['Id'];

        if( idQuestion=='' || idQuestion==null ){
            this.handleDeleteOnCreation(rowIndex);
        }else{
            this.handleDeleteRecord(idQuestion,rowIndex);
        }
    }

    //Llama al metodo deleteQuestion para realizar una 
    //eliminacion del registro en la base de datos
    handleDeleteRecord(idQuestion,rowIndex){
        deleteQuestion({idQuestion:idQuestion})
        .then(result => {
            console.log('result:'+JSON.stringify(result));
            this.handleDeleteOnCreation(rowIndex);
            this.showToastMessage('Correcto','Se elimino correctamente la pregunta','success');
        })
        .catch(error => {
            console.log('error:'+JSON.stringify(error));
            this.showToastMessage('Error',error,'error');
        });
    }

    //Eliminacion de la data a nivel de vista
    //no tiene efectos en la base de datos
    handleDeleteOnCreation(rowIndex){
        if(this.questions.length==1){
            this.questions = [];
        }else{
            this.questions.splice(rowIndex,1);
            this.questions = this.reassignPosInQuestions(this.questions);
        }
    }

    //Permite mostrar un mensaje en la pantalla
    showToastMessage(relTitle,relMessage,typeOfMessage){
        const evt = new ShowToastEvent({
            title: relTitle,
            message: relMessage,
            variant: typeOfMessage,
        });
        this.dispatchEvent(evt);
    }

    //Permite reasignar la posicion en cada elemento del array questions
    //debido a que esta data se guarda en un array y no en un mapa 
    //cuando eliminamos un elemento intermedio del array los elementos
    //siguientes no se pueden eliminar
    reassignPosInQuestions(questionsData){
        questionsData.forEach(function(element , index ){
            element.pos = index;
        });
        return questionsData;
    }
    
}