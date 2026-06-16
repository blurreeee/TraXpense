package com.arjav.TraXpense.service;

import com.arjav.TraXpense.dto.ExtractedExpenseDTO;
import com.arjav.TraXpense.entity.Expense;
import com.arjav.TraXpense.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExpenseImportService {

    private final GeminiExtractionService geminiExtractionService;
    private final ExpenseRepository expenseRepository;

    public ExpenseImportService(GeminiExtractionService geminiExtractionService, ExpenseRepository expenseRepository) {
        this.geminiExtractionService = geminiExtractionService;
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> importExpensesFromImage(MultipartFile file, Long userId) {
        try {
            // Send image directly to Gemini vision — bypasses Tesseract OCR entirely
            // (Tesseract misreads ₹ as digit '2', causing wrong amounts)
            List<ExtractedExpenseDTO> extractedList = geminiExtractionService.extractExpenseDataFromImage(file);

            List<Expense> savedExpenses = new ArrayList<>();

            for (ExtractedExpenseDTO extractedData : extractedList) {
                // Map merchant to description
                String description = (extractedData.getMerchant() != null && !extractedData.getMerchant().isEmpty())
                        ? extractedData.getMerchant()
                        : "Unknown Merchant";

                // Map category to note
                String category = (extractedData.getCategory() != null && !extractedData.getCategory().isEmpty())
                        ? extractedData.getCategory()
                        : "Uncategorized";

                // Skip duplicates silently
                boolean exists = expenseRepository.existsByUserIdAndAmountAndDateAndDescription(
                    userId, extractedData.getAmount(), extractedData.getDate(), description
                );

                if (exists) {
                    continue;
                }

                Expense expense = new Expense();
                expense.setUserId(userId);
                expense.setAmount(extractedData.getAmount());
                expense.setDate(extractedData.getDate());
                expense.setDescription(description);
                expense.setNote("Category: " + category);

                savedExpenses.add(expenseRepository.save(expense));
            }

            return savedExpenses;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import expenses: " + e.getMessage(), e);
        }
    }
}
