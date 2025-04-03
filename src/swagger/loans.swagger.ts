/**
 * @swagger
 * components:
 *   schemas:
 *     LoanApplicant:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - telephone
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         telephone:
 *           type: string
 *         totalLoan:
 *           type: string
 *     
 *     Loan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: string
 *         maturityDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [active, pending]
 *         applicant:
 *           $ref: '#/components/schemas/LoanApplicant'
 *         createdAt:
 *           type: string
 *           format: date
 * 
 * /loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of loans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Loan'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *   
 *   post:
 *     summary: Create a new loan
 *     tags: [Loans]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - maturityDate
 *               - applicant
 *             properties:
 *               amount:
 *                 type: string
 *               maturityDate:
 *                 type: string
 *                 format: date
 *               applicant:
 *                 $ref: '#/components/schemas/LoanApplicant'
 *     responses:
 *       201:
 *         description: Loan created successfully
 *
 * /loans/expired:
 *   get:
 *     summary: Get all expired loans
 *     tags: [Loans]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expired loans
 *
 * /loans/{userEmail}/get:
 *   get:
 *     summary: Get loans by user email
 *     tags: [Loans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userEmail
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user loans
 *
 * /loans/{loanId}/delete:
 *   delete:
 *     summary: Delete a loan
 *     tags: [Loans]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loan deleted successfully
 *       404:
 *         description: Loan not found
 */