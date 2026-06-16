package com.arjav.TraXpense.repository;

import com.arjav.TraXpense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByOrderByCreatedAtDesc();
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndAmountAndDateAndDescription(Long userId, java.math.BigDecimal amount, java.time.LocalDate date, String description);
}
