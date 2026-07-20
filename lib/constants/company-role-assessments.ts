export const COMPANY_ROLE_ASSESSMENTS: Record<
  string,
  Record<string, string>
> = {
  "2care-ai": {
    // Matches Job.role in hiring intel for this company.
    "Full Stack Developer":
      "https://topin-assessment-portal-beta.earlywave.in/assessment?org_id=db154bac-ef98-497b-9a9c-a3322ab86a80&auto_redirect=1",
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
