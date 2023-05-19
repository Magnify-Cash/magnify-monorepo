describe("Set paused", () => {
  it("should fail to pause escrow by non-owner", async () => {
    await expect(this.escrow.connect(alice).setPaused(true)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should pause contract", async () => {
    expect(await this.escrow.paused()).to.be.false;
    const tx = await this.escrow.setPaused(true);
    expect(tx).to.emit(this.escrow, "Paused");
    const response = await tx.wait();
    const pausedEvent = response.events.find(
      (event) => event.event == "Paused"
    ).args;

    expect(pausedEvent.account).to.equal(owner.address);

    expect(await this.escrow.paused()).to.be.true;
  });

  it("should fail to unpause escrow by non-owner", async () => {
    await expect(
      this.escrow.connect(alice).setPaused(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should unpause contract", async () => {
    expect(await this.escrow.paused()).to.be.true;
    const tx = await this.escrow.setPaused(false);

    expect(tx).to.emit(this.escrow, "Unpaused");
    const response = await tx.wait();
    const pausedEvent = response.events.find(
      (event) => event.event == "Unpaused"
    ).args;

    expect(pausedEvent.account).to.equal(owner.address);

    expect(await this.escrow.paused()).to.be.false;
  });
});
