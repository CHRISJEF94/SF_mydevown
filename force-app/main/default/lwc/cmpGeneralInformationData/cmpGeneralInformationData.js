import { LightningElement,api,track,wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getTypeTestValues from '@salesforce/apex/TestCreatorController.getTypeTestValues';
import getTestRelated from '@salesforce/apex/TestEditorController.getTestRelated';

export default class CmpGeneralInformationData extends LightningElement {
    @api recordIdActual;

    @track
    titulo='';

    @track
    descripcion='';

    @track
    instrucciones='';

    @track
    tipo="";

    @track
    autor="";

    id=null;

    tipoValues = [];
    errors;

    //Si estamos en modo edicion traera la data del test
    //en base al id que haya sido pasado por el parent
    @wire(getTestRelated,{testId: '$recordIdActual' })
    getAllDataTest({ error, data }) {
        if (data) {            
            if( data.length > 0 ){
                this.constructDataToEdit(data);
            }
        } else if (error) {
            this.errors = error;
        }
    }

    //Obtiene la data de los tipos de test
    @wire(getTypeTestValues)
    getAllTipoTest({ error, data }) {
        if (data) {
            console.log( 'getAllTipoTest:'+JSON.stringify(data) );
            this.tipoValues = this.constructTipoArray(data);
        } else if (error) {
            this.errors = error;
            this.tipoValues = this.constructTipoArrayError(data);
        }
    }

    //Devuelve la data que se ha ingresado al parent
    @api
    getTest() { 
        return {
            Id                  :   this.id,
            Name                :   this.titulo,
            Descripcion__c      :   this.descripcion,
            Intrucciones__c     :   this.instrucciones,
            Tipo__c             :   this.tipo,
            Autor__c            :   this.autor 
        };
    }

    //Metodo publico llamado desde el parent que 
    //resetea los campos luego de una inserccion
    //exitosa de la data en la BD
    @api
    resetTestInputs() { 
        this.titulo="";
        this.descripcion="";
        this.instrucciones="";
        this.autor = "";
        this.tipo = "";
    }

    @api
    refreshTestInputs(){
        console.log('ENTRO REFRESH TEST');
        refreshApex(this.getAllDataTest);
    }

    //Asigna los valores segun lo ingresado en el 
    //la vista
    handleChangeDataInput(event){
        let nameId = event.target.dataset.nameId;
        let value = event.target.value;
        if(nameId=='titulo'){
            this.titulo = value;
        }else if(nameId=='descripcion'){
            this.descripcion = value;
        }else if(nameId=='instrucciones'){
            this.instrucciones = value;
        }else if(nameId=='tipo'){
            this.tipo = value;
        }else if(nameId=='autor'){
            this.autor = value;
        }
    }

    //Construye el array de Tipos de test que se 
    //mostrara en la vista
    constructTipoArray(data){
        let arrayTipo = [];
        for (let key in data) {
            let value = data[key];
            arrayTipo.push({label:key,value:value});
        }
        return arrayTipo;
    }

    //Contruye el array de tipo de test cuando se 
    //tiene algun error
    constructTipoArrayError(){
        return[{label:'Hubo un error',value:''}];
    }

    //Asigna los valores del test 
    constructDataToEdit(dataToEdit){
        this.titulo = dataToEdit[0].Name;
        this.descripcion = dataToEdit[0].Descripcion__c;
        this.instrucciones = dataToEdit[0].Intrucciones__c;
        this.tipo = dataToEdit[0].Tipo__c;
        this.autor = dataToEdit[0].Autor__c;
        this.id = dataToEdit[0].Id;
    }

}