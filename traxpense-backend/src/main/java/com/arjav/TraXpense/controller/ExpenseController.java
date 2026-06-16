package com.arjav.TraXpense.controller;

import com.arjav.TraXpense.dto.ExpenseDTO;
import com.arjav.TraXpense.entity.Expense;
import com.arjav.TraXpense.service.ExpenseImportService;
import com.arjav.TraXpense.service.ExpenseService;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseImportService expenseImportService;

    public ExpenseController(ExpenseService expenseService, ExpenseImportService expenseImportService) {
        this.expenseService = expenseService;
        this.expenseImportService = expenseImportService;
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(expenseService.getAllExpensesByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<Expense> create(@Valid @RequestBody ExpenseDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @Valid @RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long userId) {
        expenseService.deleteExpense(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<List<Expense>> importExpense(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(expenseImportService.importExpensesFromImage(file, userId));
    }
}
