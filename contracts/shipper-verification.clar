;; Shipper Verification Contract
;; Validates authorized dangerous goods handlers

(define-data-var admin principal tx-sender)

;; Map to store verified shippers
(define-map verified-shippers principal
  {
    is-verified: bool,
    verification-date: uint,
    expiration-date: uint,
    hazmat-license-id: (string-utf8 50)
  }
)

;; Add a new verified shipper (only admin can do this)
(define-public (add-verified-shipper
    (shipper principal)
    (hazmat-license-id (string-utf8 50))
    (expiration-date uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-set verified-shippers shipper
      {
        is-verified: true,
        verification-date: block-height,
        expiration-date: expiration-date,
        hazmat-license-id: hazmat-license-id
      }
    ))
  )
)

;; Remove a verified shipper
(define-public (remove-verified-shipper (shipper principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-delete verified-shippers shipper))
  )
)

;; Check if a shipper is verified
(define-read-only (is-shipper-verified (shipper principal))
  (let ((shipper-data (map-get? verified-shippers shipper)))
    (if (is-some shipper-data)
      (let ((data (unwrap-panic shipper-data)))
        (and
          (get is-verified data)
          (<= block-height (get expiration-date data))
        )
      )
      false
    )
  )
)

;; Get shipper details
(define-read-only (get-shipper-details (shipper principal))
  (map-get? verified-shippers shipper)
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (var-set admin new-admin))
  )
)
