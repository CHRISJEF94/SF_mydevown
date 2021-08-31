import { LightningElement } from 'lwc';
import LEAD_OBJECT from '@salesforce/schema/Lead';
import registerLeadFromSite from '@salesforce/apex/cmpLeadCaptureSiteCtrl.registerLeadFromSite';

const columns = [
    { label: 'Nombre', fieldName: 'Name' },
    { label: 'Correo', fieldName: 'Email' },
    { label: 'Telefono', fieldName: 'Phone', type: 'phone' },
    { label: 'Compañia', fieldName: 'Company' },
    { label: 'Id Salesforce', fieldName: 'Id', type: 'url' },
    { label: 'Objeto', fieldName: 'ObjectDup' },
];

export default class CmpLeadCaptureSite extends LightningElement {
    leadObject = LEAD_OBJECT;

    leadObj = {
        'sobjectType': 'Lead',
        FirstName:'',
        LastName:'',
        Company:'',
        Title:'',
        LeadSource:'',
        Address:'',
        Phone:'',
        MobilePhone:'',
        Email:'',
        OwnerId:'0055w00000D3IJyAAN'
    }

    arrayDuplicates=[];
    columns = columns;

    showDuplicates;
    showSuccessMessage;

    genericOnChange(event){
        this.leadObj[event.target.name] = event.target.value;
    }

    generateArrayDuplicates(lstDuplicateResults){
        let arrayDuplicates = [];
        for( let duplicate of lstDuplicateResults ){
            let data = JSON.parse(duplicate);
            console.log(data);
            console.log(data['attributes']);
            let duplicateData = {
                Name : data.Name,
                Email : data.Email,
                Phone : data.Phone,
                Id : data.Id,
                Company : data.Company,
                ObjectDup:data['attributes'].type
                
            };
            arrayDuplicates.push( duplicateData );
        }
        return arrayDuplicates;
    }

    registerInformation() {
        registerLeadFromSite({newLead: this.leadObj})
        .then(result => {
            console.log('result',result);
            if(result.length>0){
                this.showDuplicates = true;
                this.arrayDuplicates = this.generateArrayDuplicates(result);
            }else{
                this.showSuccessMessage = true;
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
}
