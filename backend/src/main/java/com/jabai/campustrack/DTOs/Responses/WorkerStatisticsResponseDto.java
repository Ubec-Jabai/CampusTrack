package com.jabai.campustrack.DTOs.Responses;

public class WorkerStatisticsResponseDto {
    private final long assigned;
    private final long forInspection;
    private final long pendingReview;
    private final long approved;
    private final long resolved;
    private final long rejected;

    public WorkerStatisticsResponseDto(
            long assigned,
            long forInspection,
            long pendingReview,
            long approved,
            long resolved,
            long rejected
    ) {
        this.assigned = assigned;
        this.forInspection = forInspection;
        this.pendingReview = pendingReview;
        this.approved = approved;
        this.resolved = resolved;
        this.rejected = rejected;
    }

    public long getAssigned() { return assigned; }
    public long getForInspection() { return forInspection; }
    public long getPendingReview() { return pendingReview; }
    public long getApproved() { return approved; }
    public long getResolved() { return resolved; }
    public long getRejected() { return rejected; }
}
