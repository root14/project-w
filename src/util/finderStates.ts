/**
 * @constant ERR -> on error
 * @constant RAND_FAIL -> across yourself
 * @constant NOT_ENOUGH_USER -> when there are not enough people in the pool
 */

enum FinderStates {
    ERR = "0",
    RAND_FAIL = "1",
    NOTE_NOUGH_USER = "2"
}
export default FinderStates