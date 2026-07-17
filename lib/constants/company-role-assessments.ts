export const COMPANY_ROLE_ASSESSMENTS: Record<
  string,
  Record<string, string>
> = {
  "2care-ai": {
    // Matches Job.role in hiring intel for this company.
    "Full Stack Developer":
      "https://assessment.topin.tech/assessment?org_id=ce4271da-e9ef-4ea9-8f50-e3229a71e29e&auto_redirect=1",
  },
};

export function getRoleAssessmentUrl(
  companySlug: string,
  role: string,
): string | undefined {
  return COMPANY_ROLE_ASSESSMENTS[companySlug]?.[role];
}

export function getConfiguredRolesForCompany(companySlug: string): string[] {
  const roles = COMPANY_ROLE_ASSESSMENTS[companySlug];
  return roles ? Object.keys(roles) : [];
}
