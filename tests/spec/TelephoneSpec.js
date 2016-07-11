describe("telephone.canonicalize", function () {

    it("should remove white space from a phone number", function () {
        expect(telephone.canonicalize("  1 111  1111  ")).toBe("11111111");
    });

    it("should remove punctuation from a phone number", function () {
        expect(telephone.canonicalize("+(1(1))[11]-{1111}...")).toBe("11111111");
    });

    it("should remove leading zeros from, and prepend 44 to, a UK phone number", function () {
        expect(telephone.canonicalize("(020) 799 0987")).toBe("44207990987");
        expect(telephone.canonicalize("+44 0207990987")).toBe("44207990987");
        expect(telephone.canonicalize("00 44 0207990987")).toBe("44207990987");
    });

    it("should not remove leading zeros from non-UK numbers, except international code", function () {
        //not really international, just only removing leading 0 for UK
        expect(telephone.canonicalize("22 0207990987")).toBe("220207990987");
        expect(telephone.canonicalize("00 22 0207990987")).toBe("220207990987");
    });

    it("handle non-UK numbers properly", function() {pending("implement for international")});
});