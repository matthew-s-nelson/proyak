export enum WorkType {
    REMOTE = 0,
    ONSITE = 1,
    HYBRID = 2,
}

export enum EmploymentType {
    FULL_TIME = 0,
    PART_TIME = 1,
}

export interface JobPostingDTO {
    workType: WorkType,
    employmentType: EmploymentType,
    experience: number, // in years
    interestIds: string[], // array of interest IDs
    specialtyId: string, // specialty ID
}