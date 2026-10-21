import { UiService } from './ui.service';

describe('UiService confirmations',()=>{
  it('queues simultaneous confirmations and resolves each one',async()=>{
    const ui=new UiService();
    const first=ui.confirm('First','First action');
    const second=ui.confirm('Second','Second action');

    expect(ui.confirmState()?.title).toBe('First');
    ui.answer(true);
    expect(ui.confirmState()?.title).toBe('Second');
    await expect(first).resolves.toBe(true);

    ui.answer(false);
    expect(ui.confirmState()).toBeNull();
    await expect(second).resolves.toBe(false);
  });

  it('resolves queued confirmations as cancelled when leaving the session',async()=>{
    const ui=new UiService();
    const active=ui.confirm('Active','Active action');
    const queued=ui.confirm('Queued','Queued action');

    ui.cancelConfirmations();

    await expect(active).resolves.toBe(false);
    await expect(queued).resolves.toBe(false);
    expect(ui.confirmState()).toBeNull();
  });
});
