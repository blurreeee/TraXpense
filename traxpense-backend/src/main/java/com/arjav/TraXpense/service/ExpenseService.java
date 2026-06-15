package com.arjav.TraXpense.service;

import com.arjav.TraXpense.dto.ExpenseDTO;
import com.arjav.TraXpense.entity.Expense;
import com.arjav.TraXpense.exception.ResourceNotFoundException;
import com.arjav.TraXpense.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> getAllExpensesByUser(Long userId) {
        return expenseRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    public Expense createExpense(ExpenseDTO dto) {
        Expense expense = new Expense();
        expense.setUserId(dto.getUserId());
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate());
        expense.setNote(dto.getNote());
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(Long id, ExpenseDTO dto) {
        Expense existing = getExpenseById(id);
        if (!existing.getUserId().equals(dto.getUserId())) {
            throw new RuntimeException("You do not have permission to update this expense");
        }
        existing.setDescription(dto.getDescription());
        existing.setAmount(dto.getAmount());
        existing.setDate(dto.getDate());
        existing.setNote(dto.getNote());
        return expenseRepository.save(existing);
    }

    public void deleteExpense(Long id, Long userId) {
        Expense existing = getExpenseById(id);
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("You do not have permission to delete this expense");
        }
        expenseRepository.deleteById(id);
    }
}
