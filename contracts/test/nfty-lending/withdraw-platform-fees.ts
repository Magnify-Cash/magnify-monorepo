describe("Withdraw platform fees", () => {
  it("should fail to withdraw platform fees when there are none", async () => {
    await expect(
      this.escrow.withdrawPlatformFees(alice.address)
    ).to.be.revertedWith("collected platform fees = 0");
  });
});
