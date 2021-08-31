@RestResource(urlMapping='/Tests/*')
global with sharing class TestManager {
    @HttpGet
    global static List<Test__c> getAllTests() {
        return [SELECT Id,Intrucciones__c,Descripcion__c,Name,Tipo__c FROM Test__c];
    }
}