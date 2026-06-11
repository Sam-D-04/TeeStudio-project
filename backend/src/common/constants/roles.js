const ROLES = Object.freeze({
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  WAREHOUSE: "WAREHOUSE",
  PRODUCTION: "PRODUCTION",
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));
const INTERNAL_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.WAREHOUSE,
  ROLES.PRODUCTION,
]);

module.exports = {
  ROLES,
  ALL_ROLES,
  INTERNAL_ROLES,
};
