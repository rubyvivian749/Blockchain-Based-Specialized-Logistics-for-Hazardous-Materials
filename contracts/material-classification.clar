;; Material Classification Contract
;; Records hazard categories and requirements

(define-data-var admin principal tx-sender)

;; Define hazard classes
(define-constant FLAMMABLE_LIQUID u1)
(define-constant TOXIC_SUBSTANCE u2)
(define-constant CORROSIVE u3)
(define-constant RADIOACTIVE u4)
(define-constant EXPLOSIVE u5)

;; Map to store material classifications
(define-map materials (string-utf8 50)
  {
    hazard-class: uint,
    handling-requirements: (string-utf8 200),
    added-by: principal,
    added-at: uint
  }
)

;; Add a new material classification
(define-public (add-material
    (material-id (string-utf8 50))
    (hazard-class uint)
    (handling-requirements (string-utf8 200)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (asserts! (and (>= hazard-class u1) (<= hazard-class u5)) (err u400))
    (ok (map-set materials material-id
      {
        hazard-class: hazard-class,
        handling-requirements: handling-requirements,
        added-by: tx-sender,
        added-at: block-height
      }
    ))
  )
)

;; Update material classification
(define-public (update-material
    (material-id (string-utf8 50))
    (hazard-class uint)
    (handling-requirements (string-utf8 200)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (asserts! (and (>= hazard-class u1) (<= hazard-class u5)) (err u400))
    (asserts! (is-some (map-get? materials material-id)) (err u404))
    (ok (map-set materials material-id
      {
        hazard-class: hazard-class,
        handling-requirements: handling-requirements,
        added-by: tx-sender,
        added-at: block-height
      }
    ))
  )
)

;; Get material details
(define-read-only (get-material-details (material-id (string-utf8 50)))
  (map-get? materials material-id)
)

;; Check if material exists
(define-read-only (material-exists (material-id (string-utf8 50)))
  (is-some (map-get? materials material-id))
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (var-set admin new-admin))
  )
)
