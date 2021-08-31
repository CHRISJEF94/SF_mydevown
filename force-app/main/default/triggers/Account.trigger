trigger Account on Account (before insert,before update, after insert, after update) {
    AccountTriggerHandler handler = new AccountTriggerHandler();
    handler.execute();
}