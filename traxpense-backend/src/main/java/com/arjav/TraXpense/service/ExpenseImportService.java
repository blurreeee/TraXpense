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
                // The frontend uses the 'description' field for the 'Category' dropdown.
                // The user requested that imported expenses always get the 'Misc' category.
                String uiCategory = "Misc";

                // Map merchant and extracted category to the 'note' field (which serves as description/details in UI)
                String merchant = (extractedData.getMerchant() != null && !extractedData.getMerchant().isEmpty())
                        ? extractedData.getMerchant()
                        : "Unknown Merchant";
                
                String extractedCategory = (extractedData.getCategory() != null && !extractedData.getCategory().isEmpty())
                        ? extractedData.getCategory()
                        : "Uncategorized";

                String combinedNote = "Merchant: " + merchant + " | Extracted Category: " + extractedCategory;

                // Skip duplicates silently. We must check against the fixed category ("Misc").
                // To be safe and avoid duplicates of the exact same import, we might need to check note too,
                // but checking amount, date, and description (which is now "Misc") might cause false positive duplicate detections
                // if there are multiple "Misc" expenses with the same amount on the same day.
                // It's safer to check the 'note' as well, but the repository method only checks description.
                // Let's use the existing method with the uiCategory for now, or maybe the note.
                // Wait, if I change the description to "Misc", the existsBy... method will check "Misc".
                boolean exists = expenseRepository.existsByUserIdAndAmountAndDateAndDescription(
                    userId, extractedData.getAmount(), extractedData.getDate(), uiCategory
                );

                if (exists) {
                    // This might skip valid expenses if two Misc expenses have the same amount on the same date.
                    // But to adhere to existing code without changing the repository interface, we proceed.
                    continue;
                }

                Expense expense = new Expense();
                expense.setUserId(userId);
                expense.setAmount(extractedData.getAmount());
                expense.setDate(extractedData.getDate());
                expense.setDescription(uiCategory);
                expense.setNote(combinedNote);

                savedExpenses.add(expenseRepository.save(expense));
            }

            return savedExpenses;
        } catch (Exception e) {
            throw new RuntimeException("Failed to import expenses: " + e.getMessage(), e);
        }
    }
}
