import { db } from '@/db';
import { feedback } from '@/db/schema';

async function main() {
    const sampleFeedback = [
        // Complaint 1 - 3 feedback entries
        {
            complaintId: 1,
            userId: 7,
            rating: 5,
            comment: 'Excellent work! Problem resolved quickly',
            createdAt: new Date('2024-01-16T10:30:00').toISOString(),
        },
        {
            complaintId: 1,
            userId: 8,
            rating: 4,
            comment: 'Good work but took some time',
            createdAt: new Date('2024-01-16T14:20:00').toISOString(),
        },
        {
            complaintId: 1,
            userId: 9,
            rating: 5,
            comment: 'Very satisfied with the response time',
            createdAt: new Date('2024-01-17T09:15:00').toISOString(),
        },

        // Complaint 2 - 4 feedback entries
        {
            complaintId: 2,
            userId: 10,
            rating: 5,
            comment: 'Great job by the team',
            createdAt: new Date('2024-01-18T11:45:00').toISOString(),
        },
        {
            complaintId: 2,
            userId: 11,
            rating: 4,
            comment: 'Issue fixed properly',
            createdAt: new Date('2024-01-18T15:30:00').toISOString(),
        },
        {
            complaintId: 2,
            userId: 12,
            rating: 5,
            comment: 'Excellent work! Problem resolved quickly',
            createdAt: new Date('2024-01-19T08:20:00').toISOString(),
        },
        {
            complaintId: 2,
            userId: 13,
            rating: 3,
            comment: 'Okay work, could be faster',
            createdAt: new Date('2024-01-19T16:10:00').toISOString(),
        },

        // Complaint 3 - 2 feedback entries
        {
            complaintId: 3,
            userId: 14,
            rating: 4,
            comment: 'Satisfied with the resolution',
            createdAt: new Date('2024-01-21T10:00:00').toISOString(),
        },
        {
            complaintId: 3,
            userId: 15,
            rating: 5,
            comment: 'Very satisfied with the response time',
            createdAt: new Date('2024-01-21T13:45:00').toISOString(),
        },

        // Complaint 4 - 3 feedback entries
        {
            complaintId: 4,
            userId: 16,
            rating: 5,
            comment: 'Great job by the team',
            createdAt: new Date('2024-01-23T09:30:00').toISOString(),
        },
        {
            complaintId: 4,
            userId: 17,
            rating: 4,
            comment: 'Good work but took some time',
            createdAt: new Date('2024-01-23T14:15:00').toISOString(),
        },
        {
            complaintId: 4,
            userId: 18,
            rating: 3,
            comment: 'Problem resolved but not perfectly',
            createdAt: new Date('2024-01-24T10:20:00').toISOString(),
        },

        // Complaint 5 - 4 feedback entries
        {
            complaintId: 5,
            userId: 19,
            rating: 5,
            comment: 'Excellent work! Problem resolved quickly',
            createdAt: new Date('2024-01-26T11:00:00').toISOString(),
        },
        {
            complaintId: 5,
            userId: 20,
            rating: 4,
            comment: 'Issue fixed properly',
            createdAt: new Date('2024-01-26T15:30:00').toISOString(),
        },
        {
            complaintId: 5,
            userId: 21,
            rating: 4,
            comment: 'Satisfied with the resolution',
            createdAt: new Date('2024-01-27T09:45:00').toISOString(),
        },
        {
            complaintId: 5,
            userId: 7,
            rating: 3,
            comment: 'Average response time',
            createdAt: new Date('2024-01-27T14:20:00').toISOString(),
        },

        // Complaint 6 - 2 feedback entries
        {
            complaintId: 6,
            userId: 8,
            rating: 5,
            comment: 'Very satisfied with the response time',
            createdAt: new Date('2024-01-29T10:15:00').toISOString(),
        },
        {
            complaintId: 6,
            userId: 9,
            rating: 4,
            comment: 'Good work but took some time',
            createdAt: new Date('2024-01-29T16:30:00').toISOString(),
        },

        // Complaint 7 - 3 feedback entries
        {
            complaintId: 7,
            userId: 10,
            rating: 5,
            comment: 'Great job by the team',
            createdAt: new Date('2024-02-01T09:00:00').toISOString(),
        },
        {
            complaintId: 7,
            userId: 11,
            rating: 4,
            comment: 'Issue fixed properly',
            createdAt: new Date('2024-02-01T13:20:00').toISOString(),
        },
        {
            complaintId: 7,
            userId: 12,
            rating: 2,
            comment: 'Took too long to resolve',
            createdAt: new Date('2024-02-02T10:45:00').toISOString(),
        },

        // Complaint 8 - 3 feedback entries
        {
            complaintId: 8,
            userId: 13,
            rating: 5,
            comment: 'Excellent work! Problem resolved quickly',
            createdAt: new Date('2024-02-04T11:30:00').toISOString(),
        },
        {
            complaintId: 8,
            userId: 14,
            rating: 3,
            comment: 'Okay work, could be faster',
            createdAt: new Date('2024-02-04T15:10:00').toISOString(),
        },
        {
            complaintId: 8,
            userId: 15,
            rating: 4,
            comment: 'Satisfied with the resolution',
            createdAt: new Date('2024-02-05T09:20:00').toISOString(),
        },

        // Complaint 9 - 2 feedback entries
        {
            complaintId: 9,
            userId: 16,
            rating: 2,
            comment: 'Not completely satisfied',
            createdAt: new Date('2024-02-07T10:00:00').toISOString(),
        },
        {
            complaintId: 9,
            userId: 17,
            rating: 3,
            comment: 'Problem resolved but not perfectly',
            createdAt: new Date('2024-02-07T14:30:00').toISOString(),
        },

        // Complaint 10 - 4 feedback entries
        {
            complaintId: 10,
            userId: 18,
            rating: 5,
            comment: 'Very satisfied with the response time',
            createdAt: new Date('2024-02-09T09:15:00').toISOString(),
        },
        {
            complaintId: 10,
            userId: 19,
            rating: 4,
            comment: 'Good work but took some time',
            createdAt: new Date('2024-02-09T13:45:00').toISOString(),
        },
        {
            complaintId: 10,
            userId: 20,
            rating: 1,
            comment: 'Very disappointed with the service',
            createdAt: new Date('2024-02-10T10:20:00').toISOString(),
        },
        {
            complaintId: 10,
            userId: 21,
            rating: 4,
            comment: 'Issue fixed properly',
            createdAt: new Date('2024-02-10T15:00:00').toISOString(),
        },
    ];

    await db.insert(feedback).values(sampleFeedback);
    
    console.log('✅ Feedback seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});