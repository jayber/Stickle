
//are these tests redundant now using google i18n.phonenumbers?
describe("telephone.canonicalize", function () {

    it("should remove white space from a phone number", function () {
        expect(telephone.canonicalize("  1 111  1111  ")).toBe("+4411111111");
    });

    it("should remove punctuation from a phone number", function () {
        expect(telephone.canonicalize("(020) 799 0987")).toBe("+44207990987");
    });

    it("should remove leading zeros from, and prepend 44 to, a UK phone number", function () {
        expect(telephone.canonicalize("(020) 799 0987")).toBe("+44207990987");
        expect(telephone.canonicalize("+44 0207990987")).toBe("+44207990987");
        expect(telephone.canonicalize("00 44 0207990987")).toBe("+44207990987");
    });

    it("should not remove leading zeros from non-UK numbers, except international code", function () {
        expect(telephone.canonicalize("00 44 0207990987")).toBe("+44207990987");
    });

    it("handle non-UK numbers properly", function() {
        expect(telephone.canonicalize("00 33 0207990987")).toBe("+33207990987");});
});