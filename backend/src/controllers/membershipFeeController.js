const mongoose = require("mongoose");
const MembershipFee = require("../models/MembershipFee");
const Member = require("../models/Member");

const FEE_FIELDS = [
  "member",
  "year",
  "amount",
  "paymentMethod",
  "paymentStatus",
  "paymentDate",
  "reference",
  "note",
];

const pickFeeFields = (body) =>
  Object.fromEntries(
    FEE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [
      field,
      body[field],
    ]),
  );

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateFee = (query) =>
  query
    .populate("member", "nom prenom email telephone statut")
    .populate("recordedBy", "nom prenom email");

const handleFeeError = (error, res, action) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Une cotisation existe déjà pour ce membre et cette année",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: "Données de cotisation invalides",
      errors: error.errors
        ? Object.values(error.errors).map((item) => item.message)
        : undefined,
    });
  }

  console.error(`Erreur ${action} :`, error);
  return res.status(500).json({
    message: `Erreur serveur lors de ${action}`,
  });
};

const validateMember = async (memberId) => {
  if (!isValidId(memberId)) return null;
  return Member.findById(memberId);
};

const feeAlreadyExists = ({ member, year, excludedId }) => {
  const filters = { member, year };
  if (excludedId) filters._id = { $ne: excludedId };
  return MembershipFee.exists(filters);
};

const createMembershipFee = async (req, res) => {
  try {
    const feeData = pickFeeFields(req.body);

    if (!feeData.member || !feeData.year || feeData.amount === undefined) {
      return res.status(400).json({
        message: "Le membre, l'année et le montant sont obligatoires",
      });
    }

    if (!(await validateMember(feeData.member))) {
      return res.status(404).json({ message: "Membre introuvable" });
    }

    if (await feeAlreadyExists(feeData)) {
      return res.status(409).json({
        message: "Une cotisation existe déjà pour ce membre et cette année",
      });
    }

    const createdFee = await MembershipFee.create({
      ...feeData,
      recordedBy: req.admin._id,
    });
    const fee = await populateFee(
      MembershipFee.findById(createdFee._id),
    );

    return res.status(201).json({
      message: "Cotisation enregistrée avec succès",
      fee,
    });
  } catch (error) {
    return handleFeeError(error, res, "l'enregistrement de la cotisation");
  }
};

const getMembershipFees = async (req, res) => {
  try {
    const filters = {};
    if (req.query.year) filters.year = Number(req.query.year);
    if (req.query.status) filters.paymentStatus = req.query.status;
    if (req.query.member && isValidId(req.query.member)) {
      filters.member = req.query.member;
    }

    const fees = await populateFee(
      MembershipFee.find(filters).sort({ paymentDate: -1, createdAt: -1 }),
    );

    return res.status(200).json({
      message: "Liste des cotisations récupérée avec succès",
      count: fees.length,
      filters,
      fees,
    });
  } catch (error) {
    return handleFeeError(error, res, "la récupération des cotisations");
  }
};

const getMembershipFeeById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const fee = await populateFee(MembershipFee.findById(req.params.id));

    if (!fee) {
      return res.status(404).json({ message: "Cotisation introuvable" });
    }

    return res.status(200).json({
      message: "Cotisation récupérée avec succès",
      fee,
    });
  } catch (error) {
    return handleFeeError(error, res, "la récupération de la cotisation");
  }
};

const updateMembershipFee = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const fee = await MembershipFee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: "Cotisation introuvable" });
    }

    const feeData = pickFeeFields(req.body);
    const nextMember = feeData.member || fee.member;
    const nextYear = feeData.year || fee.year;

    if (feeData.member && !(await validateMember(feeData.member))) {
      return res.status(404).json({ message: "Membre introuvable" });
    }

    if (
      await feeAlreadyExists({
        member: nextMember,
        year: nextYear,
        excludedId: fee._id,
      })
    ) {
      return res.status(409).json({
        message: "Une cotisation existe déjà pour ce membre et cette année",
      });
    }

    Object.assign(fee, feeData);
    await fee.save();
    const updatedFee = await populateFee(
      MembershipFee.findById(fee._id),
    );

    return res.status(200).json({
      message: "Cotisation modifiée avec succès",
      fee: updatedFee,
    });
  } catch (error) {
    return handleFeeError(error, res, "la modification de la cotisation");
  }
};

const deleteMembershipFee = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const fee = await MembershipFee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: "Cotisation introuvable" });
    }

    await fee.deleteOne();

    return res.status(200).json({
      message: "Cotisation supprimée avec succès",
    });
  } catch (error) {
    return handleFeeError(error, res, "la suppression de la cotisation");
  }
};

module.exports = {
  createMembershipFee,
  getMembershipFees,
  getMembershipFeeById,
  updateMembershipFee,
  deleteMembershipFee,
};
