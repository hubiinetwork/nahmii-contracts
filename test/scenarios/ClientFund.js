module.exports = function (glob) {
	describe("ClientFund", function () {
		it("T001: MUST FAIL [payable]: cannot be called from owner", function (done) {
			web3.eth.sendTransaction({
				from: glob.owner,
				to: glob.web3ClientFund.address,
				value: web3.toWei(10, 'ether'),
				gas: glob.gasLimit
			},
			function (err) {
				done(err == null ? new Error('This test must fail') : null);
			});
		});
	});
};
