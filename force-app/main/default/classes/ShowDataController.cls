public with sharing class ShowDataController {

    @AuraEnabled(cacheable=true)
    public static List<Opcion__c> getOptionsRelated( Id testId ){
        return [SELECT Id,Name,Orden__c,Preguntas_Relacionadas__c,Valor__c,Orden_por_pregunta__c,Tiene_Multiples_Valores__c FROM Opcion__c WHERE Test__c = :testId ORDER BY Orden__c ASC ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Pregunta__c> getQuestionsRelated( Id testId ){
        return [SELECT Id,Descripcion__c,Orden__c,Valor__c,Usa_valores_inversos__c FROM Pregunta__c WHERE Test__c = :testId ORDER BY Orden__c ASC ];
    }

}