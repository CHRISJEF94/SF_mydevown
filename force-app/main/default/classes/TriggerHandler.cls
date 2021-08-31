public virtual class TriggerHandler {
	protected virtual void handleBeforeInsert() {}
	protected virtual void handleAfterInsert() {}
	protected virtual void handleBeforeUpdate() {}
	protected virtual void handleAfterUpdate() {}
	protected virtual void handleBeforeDelete() {}
	protected virtual void handleAfterDelete() {}
    protected virtual void handleAfterUndelete() {}
    
    public void execute() {
        switch on Trigger.operationType {
            when BEFORE_INSERT {
                this.handleBeforeInsert ();
            }
            when AFTER_INSERT {
                this.handleAfterInsert ();
            }
            when BEFORE_UPDATE {
                this.handleBeforeUpdate();
            }
            when AFTER_UPDATE {
                this.handleAfterUpdate();
            }
            when BEFORE_DELETE {
                this.handleBeforeDelete();
            }
            when AFTER_DELETE {
                this.handleAfterDelete();
            }
            when AFTER_UNDELETE {
                this.handleAfterUndelete();
            }
        }
    }
}