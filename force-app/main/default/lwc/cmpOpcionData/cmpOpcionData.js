import { LightningElement,api,track,wire } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor'
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOptionstRelated from '@salesforce/apex/TestEditorController.getOptionstRelated';
import deleteOption from '@salesforce/apex/TestEditorController.deleteOption';

export default class CmpOpcionData extends LightningElement {
    formFactor = (FORM_FACTOR == 'Large' ? true:false);

    //Ese valor es pasado desde el 
    //Aura component PADRE, que engloba todos los 
    //Web component
    //Es el id del registro actual que se esta editando
    @api recordIdActual;

    //Variable que guarda toda la data que ingresamos 
    //en la pantalla
    @track
    options = [];

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

    //Se para traer la data de opciones cuando estamos
    //en modo EDIT
    @wire(getOptionstRelated,{testId: '$recordIdActual' })
    getAllDataOptions({ error, data }) {
        if (data) {
            if( data.length > 0 ){
                this.options = this.constructDataToEdit(data);
            }
        } else if (error) {
            this.errors = error;
        }
    }

    //Es llamado por el evento wire y agrega el campo pos
    //a todos los registros
    constructDataToEdit(dataToEdit){
        let dataConstruct = [];

        dataToEdit.forEach(function(element , index ){
            dataConstruct.push({
                Id                          :   element.Id,
                pos                         :   index,
                Orden__c                    :   element.Orden__c,
                Name                        :   element.Name,
                Preguntas_Relacionadas__c   :   element.Preguntas_Relacionadas__c,
                Orden_por_pregunta__c       :   element.Orden_por_pregunta__c,
                Tiene_Multiples_Valores__c  :   element.Tiene_Multiples_Valores__c,
                Valor__c                    :   element.Valor__c,
                Test__c                     :   element.Test__c
            });
        });
        
        return dataConstruct;
    }

    addOneMoreOption() { 
        let actualNumberOfOption =  this.options.length;
        
        this.options.push({
            Id                          :   null,
            cardName                    :   'Opción '+(actualNumberOfOption+1),
            pos                         :   actualNumberOfOption,
            Orden__c                    :   0,
            Name                        :   '',
            Valor__c                    :   1,
            Tiene_Multiples_Valores__c  :   false,
            Preguntas_Relacionadas__c   :   '',
            Orden_por_pregunta__c       :   '',
            Test__c                     :   null
        });
        
        this.options.forEach(function(element , index ){
            element.pos = index
        });
    }

    @api
    getOptions(){
        if(this.options.length==0){
            return [];
        }
        let lstOptions = [];

        this.options.forEach(function(element , index ){

            lstOptions.push({
                Id                          :   element.Id,
                Orden__c                    :   (index+1) ,
                Name                        :   element.Name,
                Tiene_Multiples_Valores__c  :   element.Tiene_Multiples_Valores__c,
                Valor__c                    :   String(element.Valor__c),
                Preguntas_Relacionadas__c   :   element.Preguntas_Relacionadas__c,
                Orden_por_pregunta__c       :   element.Orden_por_pregunta__c,
                Test__c                     :   element.Test__c
            });

        });
        return lstOptions;
    }

    //Metodo que se llama al momento de editar un campo en la vista
    //guarda la data ingresada en el campo respectivo
    handleChangeDataInput(event){
        let rowIndex = event.target.dataset.rowIndex;
        let nameId = event.target.dataset.nameId;
        let value = event.target.value;
        if( nameId == 'Tiene_Multiples_Valores__c' ){
            this.setTieneMultiplesValoresValue(rowIndex);
        }else{
            this.options[rowIndex][nameId] = value;
        }
    }

    //El seteo de valores true o false se tiene que especificar manualmente
    //ya que no se puede "triggear" el cambio de un checkbox
    //sino que se tiene que hacer una verificacion mediante un if - else
    setTieneMultiplesValoresValue(rowIndex){
        let actualValue = this.options[rowIndex]['Tiene_Multiples_Valores__c'];
        if(!actualValue){
            this.options[rowIndex]['Tiene_Multiples_Valores__c'] = true;
        }else{
            this.options[rowIndex]['Tiene_Multiples_Valores__c'] = false;
        }
    }

    //Metodo inicial de eliminación de data
    handleDeleteOption(event) { 
        let rowIndex = event.target.dataset.rowIndex;
        if(this.getEventMethod() == 'CREATE'){
            this.handleDeleteOnCreation(rowIndex);
        }else{
            this.handleDeleteOnEdition(rowIndex);
        }
    }


    //Eliminacion de la data a nivel de vista
    //no tiene efectos en la base de datos
    handleDeleteOnCreation(rowIndex){
        if(this.options.length==1){
            this.options = [];
        }else{
            this.options.splice(rowIndex,1);
            this.options = this.reassignPosInOptions(this.options);
        }
    }

    //Aunque se esta en modo EDICION hay filas de preguntas
    //que no poseen Id, por lo tanto se debe hacer una 
    //eliminacion a nivel de vista, en otras se hara una
    //eliminacion a nivel de base de datos
    handleDeleteOnEdition(rowIndex){
        let idOption = this.options[rowIndex]['Id'];
        if( idOption=='' || idOption==null ){
            this.handleDeleteOnCreation(rowIndex);
        }else{
            this.handleDeleteRecord(idOption,rowIndex);
        }
    }

    //Llama al metodo deleteQuestion para realizar una 
    //eliminacion del registro en la base de datos
    handleDeleteRecord(idOption,rowIndex){
        deleteOption({idOption:idOption})
        .then(result => {
            this.handleDeleteOnCreation(rowIndex);
            this.showToastMessage('Correcto','Se elimino correctamente la opcion','success');
        })
        .catch(error => {
            this.showToastMessage('Error',error,'error');
        });
    }

    //Permite reasignar la posicion en cada elemento del array options
    //debido a que esta data se guarda en un array y no en un mapa 
    //cuando eliminamos un elemento intermedio del array los elementos
    //siguientes no se pueden eliminar
    reassignPosInOptions(optionsData){
        optionsData.forEach(function(element , index ){
            element.pos = index;
        });
        return optionsData;
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

    //Metodo publico que nos permite limpiar toda 
    //la data almacenada en la variable de
    //options
    @api
    resetOpcionInputs() { 
        this.options = [];
    }

    //Metodo publico que nos permite actualizar toda 
    //la data almacenada en la variable de
    //options
    @api
    refreshOpcionInputs(){
        refreshApex(this.getAllDataOptions);
    }

}